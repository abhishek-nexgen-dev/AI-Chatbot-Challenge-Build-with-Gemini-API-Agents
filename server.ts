import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function formatErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed?.error?.message) return parsed.error.message;
    } catch {}
    return error;
  }
  if (error.message) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error?.message) return parsed.error.message;
    } catch {}
    return error.message;
  }
  return String(error);
}

function normalizeContents(contents: Array<{ role: 'user' | 'model'; parts: any[] }>) {
  const normalized: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

  for (const item of contents) {
    if (!item.parts || item.parts.length === 0) continue;
    const role: 'user' | 'model' = item.role === 'model' ? 'model' : 'user';

    if (normalized.length === 0) {
      if (role === 'model') continue;
      normalized.push({ role, parts: [...item.parts] });
    } else {
      const prev = normalized[normalized.length - 1];
      if (prev.role === role) {
        prev.parts.push(...item.parts);
      } else {
        normalized.push({ role, parts: [...item.parts] });
      }
    }
  }

  return normalized;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/chat/stream', async (req, res) => {
  const { messages, model = 'gemini-flash-latest', systemInstruction, temperature } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.write(
      `data: ${JSON.stringify({
        error:
          'GEMINI_API_KEY is not set. Please add your GEMINI_API_KEY in the Settings > Secrets panel or .env file.',
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const rawContents = Array.isArray(messages) ? messages : [];
  const contents = normalizeContents(
    rawContents.map((m: any) => {
      const role: 'user' | 'model' = m.role === 'model' ? 'model' : 'user';
      const parts: any[] = [];

      if (m.attachments && Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.mimeType?.startsWith('image/') && att.base64) {
            const rawBase64 = att.base64.includes(',')
              ? att.base64.split(',')[1]
              : att.base64;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: rawBase64,
              },
            });
          } else if (att.content) {
            parts.push({
              text: `[Attached file: ${att.name}]\n\`\`\`\n${att.content}\n\`\`\``,
            });
          }
        }
      }

      if (m.content && typeof m.content === 'string' && m.content.trim()) {
        parts.push({ text: m.content.trim() });
      }

      return { role, parts };
    })
  );

  if (contents.length === 0) {
    return res.status(400).json({ error: 'No valid message content provided.' });
  }

  const config: any = {};
  if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
    config.systemInstruction = systemInstruction.trim();
  }
  if (model !== 'gemini-3.8-flash' && typeof temperature === 'number') {
    config.temperature = Math.max(0, Math.min(2, temperature));
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let isClientDisconnected = false;
  req.on('close', () => {
    isClientDisconnected = true;
  });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model || 'gemini-flash-latest',
      contents,
      config,
    });

    for await (const chunk of responseStream) {
      if (isClientDisconnected) break;
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    if (!isClientDisconnected) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error: any) {
    console.error('Gemini stream error:', error);
    if (!isClientDisconnected) {
      const errorMsg = formatErrorMessage(error);
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages, model = 'gemini-flash-latest', systemInstruction, temperature } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({
      error:
        'GEMINI_API_KEY is not set. Please add your GEMINI_API_KEY in the Settings > Secrets panel or .env file.',
    });
  }

  const rawContents = Array.isArray(messages) ? messages : [];
  const contents = normalizeContents(
    rawContents.map((m: any) => {
      const role: 'user' | 'model' = m.role === 'model' ? 'model' : 'user';
      const parts: any[] = [];

      if (m.attachments && Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.mimeType?.startsWith('image/') && att.base64) {
            const rawBase64 = att.base64.includes(',')
              ? att.base64.split(',')[1]
              : att.base64;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: rawBase64,
              },
            });
          } else if (att.content) {
            parts.push({
              text: `[Attached file: ${att.name}]\n\`\`\`\n${att.content}\n\`\`\``,
            });
          }
        }
      }

      if (m.content && typeof m.content === 'string' && m.content.trim()) {
        parts.push({ text: m.content.trim() });
      }

      return { role, parts };
    })
  );

  if (contents.length === 0) {
    return res.status(400).json({ error: 'No valid message content provided.' });
  }

  const config: any = {};
  if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
    config.systemInstruction = systemInstruction.trim();
  }
  if (model !== 'gemini-3.8-flash' && typeof temperature === 'number') {
    config.temperature = Math.max(0, Math.min(2, temperature));
  }

  try {
    const response = await ai.models.generateContent({
      model: model || 'gemini-flash-latest',
      contents,
      config,
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: formatErrorMessage(error) });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
