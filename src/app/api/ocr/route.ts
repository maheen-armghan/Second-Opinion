import { NextResponse } from 'next/server';
import { GeminiProvider } from '@/lib/ocr-providers/gemini-provider';
import { TrOCRProvider } from '@/lib/ocr-providers/trocr-provider';
import { OcrProvider } from '@/lib/ocr-providers/types';

// Preset sample prescription OCR outputs for demonstration & test scenarios
const PRESET_SAMPLE_OCR: Record<string, { doctor: string; patient: string; lines: string[] }> = {
  sample1: {
    doctor: 'Dr. Tariq Mahmood (FCPS, General Medicine)',
    patient: 'Zahid Khan (Age: 45)',
    lines: ['Panadol 500mg - 1-0-1', 'Risek 20mg - 1-0-0 (Bef Meal)']
  },
  sample2: {
    doctor: 'Dr. Ayesha Malik (MBBS)',
    patient: 'Mrs. Bilquis Akhtar (Age: 52)',
    lines: ['Panadol 1500mg - 1-1-1 (High Dose)', 'Flagyl 400mg - 1-0-1']
  },
  sample3: {
    doctor: 'Dr. Shahzad Rasheed (Cardiologist)',
    patient: 'Mohammad Rashid (Age: 61)',
    lines: ['Warfarin 5mg - 1-0-0', 'Disprin 75mg - 1-0-1', 'Risek 20mg - 1-0-0']
  },
  sample4: {
    doctor: 'Dr. M. Akram (Associate Prof. Cardiology)',
    patient: 'Chaudhry Muhammad Aslam (Age: 68)',
    lines: ['Enalapril 10mg - 1-0-1', 'Aldactone 25mg - 1-0-0', 'Lipiget 20mg - 0-0-1']
  },
  sample5: {
    doctor: 'Dr. Unknown (Illegible OPD Slip)',
    patient: 'Patient #4092',
    lines: ['Xyzlln 500???', 'Brfnnn 400???', 'Unclear scribbles']
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sampleId, imageBase64 } = body;

    // Handle preset sample selections directly
    if (sampleId && PRESET_SAMPLE_OCR[sampleId]) {
      const preset = PRESET_SAMPLE_OCR[sampleId];
      return NextResponse.json({
        success: true,
        source: 'preset_sample',
        doctorName: preset.doctor,
        patientName: preset.patient,
        rawTextLines: preset.lines,
      });
    }

    // Provider-based Extraction for uploaded prescription images
    if (imageBase64) {
      const providerName = process.env.OCR_PROVIDER || 'gemini';
      let provider: OcrProvider;

      if (providerName === 'trocr') {
        provider = new TrOCRProvider();
      } else {
        provider = new GeminiProvider();
      }

      const result = await provider.extract(imageBase64);

      if (result.success) {
        return NextResponse.json({
          success: true,
          source: result.source,
          doctorName: result.doctorName,
          patientName: result.patientName,
          patientAge: result.patientAge,
          rawTextLines: result.rawTextLines || [],
          medicinesMeta: result.medicines || [],
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Extraction failed' 
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'No image or sampleId provided'
    });

  } catch (error: any) {
    console.error('[OCR API] Pipeline error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
