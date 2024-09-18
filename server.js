import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve the HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/generate-music', async (req, res) => {
  const { inputs } = req.body;
  
  try {
    // Use current timestamp to add variability
    const timestamp = Date.now();
    const modifiedInputs = `${inputs} (${timestamp})`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-stereo-small",
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: modifiedInputs }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.arrayBuffer();
    res.set('Content-Type', 'audio/wav');
    res.send(Buffer.from(result));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating music' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});