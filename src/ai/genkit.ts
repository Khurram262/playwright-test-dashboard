import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Get your free API key from: https://aistudio.google.com/apikey
// Add it to .env.local as: GOOGLE_GENAI_API_KEY=your_key_here

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
