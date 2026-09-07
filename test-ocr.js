const fs = require('fs');

async function testOCR() {
  try {
    const imagePath = "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffca47c3-8e21-4058-883b-97c7439c17e6\\.user_uploaded\\media_1788691007497.png";
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = "data:image/png;base64," + imageBuffer.toString('base64');

    console.log("Sending request to http://localhost:3000/api/ocr...");
    const response = await fetch('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageBase64: base64Image })
    });

    const data = await response.json();
    console.log("Response JSON:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test script failed:", error);
  }
}

testOCR();
