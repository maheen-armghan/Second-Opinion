export interface OcrProvider {
  extract(imageBase64: string): Promise<OcrExtractionResult>;
}

export interface OcrExtractionResult {
  success: boolean;
  source?: string;
  doctorName?: string;
  patientName?: string;
  patientAge?: string;
  medicines?: {
    raw_text: string;
    drug_name: string;
    dosage?: string;
    frequency?: string;
    notes?: string;
    extraction_certainty: 'high' | 'medium' | 'low';
  }[];
  rawTextLines?: string[];
  error?: string;
}
