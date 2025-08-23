export const GEMINI_CONFIG = {
  MODEL: 'gemini-1.5-flash',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7
};

export const getGeminiConfig = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY environment variable is required and must be set in Vercel. Local .env files are not supported.');
  }
  return {
    API_KEY: apiKey,
    MODEL: GEMINI_CONFIG.MODEL,
    MAX_TOKENS: GEMINI_CONFIG.MAX_TOKENS,
    TEMPERATURE: GEMINI_CONFIG.TEMPERATURE
  };
};
