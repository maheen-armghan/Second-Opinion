import { OcrProvider, OcrExtractionResult } from './types';

const VISION_LLM_PROMPT = `
You are an expert medical vision AI specializing in reading handwritten prescription slips (OPD slips) and printed medical documents, with deep knowledge of Pakistani and South Asian prescribing patterns.

Carefully inspect the provided prescription image and extract all prescribed medicines, dosages, frequencies, doctor details, and patient information.

Interpret common Pakistani/South Asian prescription shorthand notations:
- "1-0-1" or "BD": Twice daily (Morning and Evening)
- "1-1-1" or "TDS" or "TID": Three times daily (Morning, Afternoon, Evening)
- "1-0-0" or "OD": Once daily (Morning)
- "0-0-1": Once daily (Night / Bedtime)
- "HS" or "at bedtime": Bedtime dose
- "SOS" or "PRN": As needed
- "Bef Meal" / "BBF" / "A/F" / "Aft Meal": Before or after meal
- Numbers/units like "5mg", "500mg", "1g", "10ml", "1 tab", "2 cap", "5ml" are dosages
- If a field is not visible or legible on the prescription, set it to null — do NOT guess or invent information.

You MUST respond with ONLY a raw JSON object. Do NOT include any markdown formatting, backticks (\`\`\`json), or explanation text. Start your response with { and end with }.

Required JSON schema:
{
  "doctor_name": "string or null",
  "clinic_name": "string or null",
  "patient_name": "string or null",
  "patient_age": "string or null",
  "medicines": [
    {
      "raw_text": "exact text as written on the prescription for this line item",
      "drug_name": "medicine name e.g. Panadol",
      "dosage": "dose e.g. 500mg",
      "frequency": "how often e.g. BD (1-0-1 / Twice Daily)",
      "notes": "any extra instructions or null",
      "extraction_certainty": "high | medium | low"
    }
  ]
}

Set "extraction_certainty" to:
- "high" for clear, legible text where drug name and dosage are confident
- "medium" for partially clear text where dosage or frequency is slightly uncertain
- "low" for ambiguous, heavily handwritten, scribbled, or low confidence fields
`;

export class GeminiProvider implements OcrProvider {
  async extract(imageBase64: string): Promise<OcrExtractionResult> {
    console.log('[GeminiProvider] Initiating vision extraction pipeline...');
    const apiKey = process.env.GEMINI_API_KEY || process.env.VISION_LLM_API_KEY || process.env.GOOGLE_API_KEY;

    console.log('[Vision-LLM] API key configured:', !!apiKey);

    if (!apiKey) {
      console.warn('[GeminiProvider] GEMINI_API_KEY not configured in environment variables.');
      return { 
        success: false, 
        error: 'GEMINI_API_KEY not configured in environment variables. Please set GEMINI_API_KEY in .env.local' 
      };
    }

    try {
      // Clean base64 header if present
      const base64Clean = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const modelsToTry = [primaryModel, 'gemini-flash-latest', 'gemini-2.5-flash'];
      
      let apiRes: Response | null = null;
      let lastErrorText = '';
      let usedModel = primaryModel;

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
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      };

      for (const model of modelsToTry) {
        usedModel = model;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        console.log(`[Vision-LLM] Sending request to Gemini (model: ${model})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 sec timeout

        try {
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visionPayload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log('[Vision-LLM] Response status:', response.status);

          if (response.ok) {
            apiRes = response;
            break;
          } else {
            lastErrorText = await response.text();
            console.error(`[Vision-LLM] Error response body (model: ${model}):`, lastErrorText);
            // If it's a 404 model not found, try fallback model in loop
            if (response.status !== 404) {
              break;
            }
          }
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          if (fetchErr.name === 'AbortError') {
            console.error('[GeminiProvider] Vision API request timed out (exceeded 20s)');
            return { success: false, error: 'Vision API request timed out (exceeded 20 seconds)' };
          }
          throw fetchErr;
        }
      }

      if (!apiRes || !apiRes.ok) {
        return { 
          success: false, 
          error: `Gemini API call failed (${usedModel}): ${lastErrorText || 'Unknown error'}` 
        };
      }

      const apiJson = await apiRes.json();
      const rawText = apiJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        console.error('[GeminiProvider] No text content in Gemini response:', JSON.stringify(apiJson));
        return { success: false, error: 'No text returned from Gemini Vision API' };
      }

      // Robust JSON extraction
      let jsonString = rawText.trim();
      if (jsonString.includes('```')) {
        jsonString = jsonString.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      }
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }

      let parsedData: any;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseErr: any) {
        console.error('[Vision-LLM] Failed to parse JSON output:', jsonString);
        return { success: false, error: `Failed to parse Gemini output: ${parseErr.message}` };
      }

      console.log(`[Vision-LLM] Successfully extracted structured prescription data: ${parsedData.medicines?.length || 0} medicines found.`);

      const rawLines = parsedData.medicines?.map((m: any) => 
        m.raw_text || `${m.drug_name} ${m.dosage || ''} - ${m.frequency || ''}`.trim()
      ) || [];

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
      console.error('[GeminiProvider] Vision API processing error:', error);
      return { success: false, error: error.message || 'Vision API processing error' };
    }
  }
}

