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

async function checkModelsAndRun() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('No API key found in .env or .env.local or process.env');
    return;
  }

  console.log('API Key found! Testing ListModels on Google Gemini API...');
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(listUrl);
    const data = await res.json();
    if (data.models) {
      console.log('\n--- AVAILABLE GEMINI MODELS FOR THIS KEY ---');
      const generateModels = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      console.log(generateModels);
    } else {
      console.log('ListModels response:', data);
    }
  } catch (err) {
    console.error('Error fetching model list:', err);
  }
}

checkModelsAndRun().catch(console.error);
