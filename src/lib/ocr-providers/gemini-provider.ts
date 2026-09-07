import { OcrProvider, OcrExtractionResult } from './types';

const VISION_LLM_PROMPT = `
You are an expert medical vision AI specializing in reading Pakistani/South Asian handwritten prescription slips (OPD slips).

Carefully inspect the provided prescription image and extract all prescribed medicines, dosages, frequencies, doctor details, and patient information.

Interpret common Pakistani/South Asian prescription shorthand notations:
- "1-0-1" or "BD": Twice daily (Morning and Evening)
- "1-1-1" or "TDS" or "TID": Three times daily (Morning, Afternoon, Evening)
- "1-0-0" or "OD": Once daily (morning)
- "0-0-1": Once daily (night)
- "HS" or "at bedtime": Bedtime dose
- "SOS" or "PRN": As needed
- "Bef Meal" or "A/F" or "Aft Meal": Before or after meal
- Numbers like "5mg", "500mg", "1g", "10ml" are dosages
- If a field is not visible or legible, set it to null — do NOT guess.

You MUST respond with ONLY a raw JSON object. Do NOT include any markdown, code fences, backticks, or explanation text. Start your response with { and end with }.

Required JSON schema:
{
  "doctor_name": "string or null",
  "clinic_name": "string or null",
  "patient_name": "string or null",
  "patient_age": "string or null",
  "medicines": [
    {
      "raw_text": "exact text as written on the prescription",
      "drug_name": "medicine name e.g. Panadol",
      "dosage": "dose e.g. 500mg",
      "frequency": "how often e.g. BD (1-0-1 / Twice Daily)",
      "notes": "any extra instructions or null",
      "extraction_certainty": "high | medium | low"
    }
  ]
}

Set "extraction_certainty" to "low" for any field that is ambiguous, illegible, or uncertain.
`;

export class GeminiProvider implements OcrProvider {
  async extract(imageBase64: string): Promise<OcrExtractionResult> {
    console.log('[GeminiProvider] Initiating vision extraction pipeline...');
    const apiKey = process.env.GEMINI_API_KEY || process.env.VISION_LLM_API_KEY || process.env.GOOGLE_API_KEY;

    console.log('[Vision-LLM] API key configured:', !!apiKey);

    if (!apiKey) {
      console.warn('[GeminiProvider] GEMINI_API_KEY not configured in environment variables.');
      return { success: false, error: 'GEMINI_API_KEY not configured in environment variables' };
    }

    try {
      // Clean base64 header if present
      const base64Clean = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const visionPayload = {
        contents: [
          {
            parts: [
              { text: VISION_LLM_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Clean,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      };

      console.log('[Vision-LLM] Sending request to Gemini...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const apiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('[Vision-LLM] Response status:', apiRes.status);

      if (!apiRes.ok) {
        const errorBody = await apiRes.text();
        console.error('[Vision-LLM] Error response body:', errorBody);
        return { success: false, error: `Vision API call failed with status: ${apiRes.status}` };
      }

      const apiJson = await apiRes.json();
      const rawText = apiJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
         return { success: false, error: 'No text returned from Gemini API' };
      }

      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJsonStr);

      console.log(`[Vision-LLM] Successfully extracted structured prescription data: ${parsedData.medicines?.length || 0} medicines found.`);

      const rawLines = parsedData.medicines?.map((m: any) => m.raw_text || `${m.drug_name} ${m.dosage || ''} - ${m.frequency || ''}`) || [];

      return {
        success: true,
        source: 'vision_llm_api',
        doctorName: parsedData.doctor_name || 'Dr. Prescribed (OPD Clinic)',
        patientName: parsedData.patient_name || 'Prescription Patient',
        patientAge: parsedData.patient_age || undefined,
        rawTextLines: rawLines,
        medicines: parsedData.medicines || [],
      };
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('[GeminiProvider] Vision API request timed out');
        return { success: false, error: 'Vision API request timed out (exceeded 20 seconds)' };
      }
      console.error('[GeminiProvider] Vision API processing error:', error);
      return { success: false, error: error.message || 'Vision API processing error' };
    }
  }
}
