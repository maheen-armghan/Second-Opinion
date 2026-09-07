import { OcrProvider, OcrExtractionResult } from './types';

export class TrOCRProvider implements OcrProvider {
  async extract(imageBase64: string): Promise<OcrExtractionResult> {
    const endpoint = process.env.TROCR_INFERENCE_ENDPOINT;
    
    if (!endpoint) {
      return { success: false, error: "TROCR_INFERENCE_ENDPOINT not configured" };
    }

    // POST the image to the external inference API (e.g., a Hugging Face Space
    // or other lightweight hosted endpoint running the fine-tuned TrOCR model)
    // and map its response into the OcrExtractionResult shape above.
    
    // Note: TrOCR does word-level recognition only.
    // The external inference endpoint (built separately) is responsible for: 
    // (a) segmenting a full prescription image into individual word/line crops if needed
    // (b) running each crop through the model
    // (c) applying rule-based parsing (regex for mg/ml, frequency shorthand like 1-0-1, BD, TDS, OD) 
    // to split raw OCR text into drug_name/dosage/frequency before returning it in the shape above.
    // The Next.js side should not need to do this splitting itself.
    
    throw new Error("TrOCR provider not yet implemented");
  }
}
