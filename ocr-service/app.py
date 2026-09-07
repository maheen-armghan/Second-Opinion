"""
Second Opinion - Handwriting OCR Microservice Contract
Deployable independently on Hugging Face Spaces (Free Tier) or FastAPI
"""

import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="Second Opinion - Rx Handwriting OCR Service",
    description="Microservice endpoint for handwritten prescription OCR recognition",
    version="1.0.0",
)

class OcrRequest(BaseModel):
    image: str  # Base64 encoded image string
    vocabulary_constraint: Optional[List[str]] = None

class OcrResponse(BaseModel):
    success: bool
    doctorName: str
    patientName: str
    lines: List[str]
    confidence_score: float

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Second Opinion OCR Inference API", "platform": "Hugging Face Space"}

@app.post("/api/ocr", response_model=OcrResponse)
async def process_prescription_ocr(payload: OcrRequest):
    """
    Accepts a base64 encoded prescription image and extracts text lines
    constrained to Pakistani drug names & dosage patterns.
    """
    if not payload.image:
        raise HTTPException(status_code=400, detail="Base64 image is required")

    # In production, pass payload.image to Donut / CRNN / TrOCR fine-tuned model weights
    # Here we demonstrate the standard REST microservice response contract:
    return OcrResponse(
        success=True,
        doctorName="Dr. Tariq Mahmood (FCPS)",
        patientName="Patient Record #8821",
        lines=[
            "Augmentin 625mg - 1-0-1",
            "Brufen 400mg - 1-0-1",
            "Risek 20mg - 1-0-0"
        ],
        confidence_score=0.92
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
