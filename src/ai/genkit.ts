import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Get your free API key from: https://aistudio.google.com/apike        

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
