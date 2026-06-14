import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let ai = null;

export function getGemini() {
  if (ai) return ai;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== '') {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      console.log('[GEMINI] GoogleGenAI client initialized successfully.');
    } catch (e) {
      console.error('[GEMINI ERROR] Failed to initialize GoogleGenAI client:', e);
    }
  } else {
    console.warn('[WARNING] GEMINI_API_KEY not found or is default placeholder in server environment variables. AI operations will run on fallback simulation mode.');
  }
  return ai;
}

