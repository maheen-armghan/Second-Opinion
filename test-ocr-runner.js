const fs = require('fs');
const path = require('path');

function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.VISION_LLM_API_KEY) return process.env.VISION_LLM_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;

  for (const envFile of ['.env.local', '.env']) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) continue;
        const [key, val] = trimmed.split('=');
        if (['GEMINI_API_KEY', 'VISION_LLM_API_KEY', 'GOOGLE_API_KEY'].includes(key?.trim())) {
          return val?.trim();
        }
      }
    }
  }
  return null;
}

async function runLiveTest() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('No API key found in .env or .env.local');
    return;
  }
  process.env.GEMINI_API_KEY = apiKey;

  console.log('=== RUNNING LIVE GEMINI VISION OCR TEST ===\n');
  const { GeminiProvider } = require('./src/lib/ocr-providers/gemini-provider');
  const provider = new GeminiProvider();

  const imgPath1 = path.join(__dirname, 'test-images', 'prescription1.jpg');
  if (fs.existsSync(imgPath1)) {
    console.log(`\n--- Test Image 1: ${imgPath1} ---`);
    const imgBuf = fs.readFileSync(imgPath1);
    const b64 = 'data:image/jpeg;base64,' + imgBuf.toString('base64');
    const res1 = await provider.extract(b64);
    console.log('Result for Image 1:');
    console.log(JSON.stringify(res1, null, 2));
  }

  const imgPath2 = path.join(__dirname, 'test-images', 'prescription2.jpg');
  if (fs.existsSync(imgPath2)) {
    console.log(`\n--- Test Image 2: ${imgPath2} ---`);
    const imgBuf = fs.readFileSync(imgPath2);
    const b64 = 'data:image/jpeg;base64,' + imgBuf.toString('base64');
    const res2 = await provider.extract(b64);
    console.log('Result for Image 2:');
    console.log(JSON.stringify(res2, null, 2));
  }
}

runLiveTest().catch(console.error);
