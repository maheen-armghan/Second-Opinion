# Second Opinion - OCR Microservice

This folder contains the standalone Python OCR microservice designed for **free-tier hosting** (e.g. Hugging Face Spaces free Docker/FastAPI tier).

## Deployment to Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) with **Docker** or **FastAPI** SDK (Free Tier CPU/GPU).
2. Upload `app.py` and `requirements.txt`.
3. Set your Next.js environment variable in Vercel:
   ```env
   OCR_API_URL=https://<your-space-name>.hf.space/api/ocr
   ```
4. The Next.js backend (`/api/ocr`) will automatically route incoming image uploads to your Hugging Face Space OCR inference endpoint.
