import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getGeminiConfig } from '../../config/geminiConfig';

class GeminiAPIService {
  constructor() {
    this.google = null;
    this.model = null;
    this.isInitialized = false;
    this.config = getGeminiConfig();
  }

  initialize() {
    if (!this.config.API_KEY) {
      console.warn('Gemini API key is missing.');
      this.isInitialized = false;
      return false;
    }
    try {
      this.google = createGoogleGenerativeAI({
        apiKey: this.config.API_KEY,
      });
      this.model = this.google(this.config.MODEL);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      this.isInitialized = false;
      return false;
    }
  }

  isReady() {
    return this.isInitialized && this.model !== null;
  }

  async getHealthAdvice(userQuery, healthContext = null) {
    if (!this.isReady()) {
      throw new Error('Gemini API is not initialized. Please set the API key first.');
    }
    try {
      const prompt = this.createHealthPrompt(userQuery, healthContext);
      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
      });
      return this.formatHealthResponse(text);
    } catch (error) {
      console.error('Error getting health advice from Gemini:', error);
      throw error;
    }
  }

  async analyzeMedicalReport(fileContent, fileName) {
    if (!this.isReady()) {
      throw new Error('Gemini API is not initialized. Please set the API key first.');
    }
    try {
      const prompt = this.createMedicalReportPrompt(fileContent, fileName);
      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
      });
      return this.formatMedicalReportResponse(text);
    } catch (error) {
      console.error('Error analyzing medical report with Gemini:', error);
      throw error;
    }
  }

  async analyzePrescription(fileContent, fileName) {
    if (!this.isReady()) {
      throw new Error('Gemini API is not initialized. Please set the API key first.');
    }
    try {
      const prompt = this.createPrescriptionPrompt(fileContent, fileName);
      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
      });
      return this.formatPrescriptionResponse(text);
    } catch (error) {
      console.error('Error analyzing prescription with Gemini:', error);
      throw error;
    }
  }

  createHealthPrompt(userQuery, healthContext) {
    let prompt = `You are Medikami, a professional AI health assistant. 

**User Query:** ${userQuery}

**RESPONSE GUIDELINES:**

**1. Common Text Patterns (respond naturally):**
- "thanks", "thank you", "thx" → "You're welcome! 😊 I'm here to help!"
- "hello", "hi", "hey" → "Hello! 👋 I'm Medikami, your AI health assistant. How can I help?"
- "how are you" → "I'm doing great, thank you! 😊 How can I assist you with your health today?"
- "bye", "goodbye" → "Take care! 👋 Feel free to come back anytime for health advice!"

**2. Unrelated Questions (suggest health focus):**
- If user asks about weather, politics, sports, etc. → "I'm focused on health and wellness! 💪 Would you like to ask me about any health concerns, diet advice, or wellness tips?"
- If user asks about personal problems → "I'm here to help with health-related questions! 🏥 For personal advice, consider talking to a counselor or trusted friend."

**3. Serious Medical Emergencies (provide guidance):**
- If user mentions severe symptoms → "This sounds serious! 🚨 Please call emergency services (911) or visit the nearest hospital immediately. I can't provide emergency medical care."
- If user mentions self-harm → "I'm concerned about your safety. 🆘 Please call a crisis hotline or seek immediate professional help. You're not alone."

**4. Medical Queries (use structured format):**

💊 **Prescription Medications**
[Provide information about common prescription medications that might be relevant, including their typical uses and considerations. Note: This is for informational purposes only - actual prescriptions must come from licensed healthcare providers. Use simple text, no tables.]

🥗 **Dietary Guidance**
✅ **What to Eat:**
[List 6-8 foods that are good for the condition.]

❌ **What to Avoid:**
[List 4-6 foods to avoid for the condition.]

🏃‍♂️ **Recommended Exercises**
[Suggest 3-4 simple and relevant exercises. e.g., "Light walking for 30 minutes daily", "Stretching exercises for neck pain".]

⚠️ **Disclaimer**
[Include this exact disclaimer: "This advice is for informational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider for any health concerns."]


**Response Requirements:**
- For medical queries: Follow the exact format above
- For general conversation: Respond naturally and warmly
- For unrelated topics: Gently redirect to health focus
- For emergencies: Provide appropriate guidance and resources
- Use simple text format for prescriptions (no tables or vertical lines)
- Include specific brand names for medications when appropriate
- Suggest appropriate diet and exercise recommendations
- Keep it concise and practical
- Maximum 400 words total
`;

    if (healthContext && healthContext.conditions && healthContext.conditions.length > 0) {
      prompt += `

**User's Health Context:** The user has the following health conditions: ${healthContext.conditions.join(', ')}. Please consider these when providing advice.`;
    }

    return prompt;
  }

  createMedicalReportPrompt(fileContent, fileName) {
    return `You are Medikami, analyzing a medical report. Provide CONCISE insights.

**Report:** ${fileName}
**Content:** ${fileContent}

**Requirements:**
- Keep response SHORT (max 200 words)
- Focus on KEY findings only
- Use clear headings with emojis
- Provide 2-3 main recommendations maximum
- Include brief safety note

**Format:**
**🔬 Key Findings** (2-3 bullet points)
**💊 Main Recommendations** (2-3 bullet points)
**⚠️ Safety Note** (1 sentence)

**Important:** Be direct, avoid overwhelming details, focus on actionable advice.`;
  }

  createPrescriptionPrompt(fileContent, fileName) {
    return `You are Medikami, analyzing a prescription. Provide CONCISE guidance.

**Prescription:** ${fileName}
**Content:** ${fileContent}

**Requirements:**
- Keep response SHORT (max 200 words)
- Focus on KEY medication info only
- Use clear headings with emojis
- Provide 2-3 main points maximum
- Include brief safety note

**Format:**
**💊 Medications** (list main medications)
**🍽️ Key Interactions** (2-3 bullet points)
**⚠️ Safety Note** (1 sentence)

**Important:** Be direct, focus on essential information.`;
  }

  formatHealthResponse(text) {
    let formattedText = text.trim();
    
    // Remove leading numbers and asterisks
    formattedText = formattedText.replace(/^\d+\.\s*/gm, '');
    formattedText = formattedText.replace(/^\*\s*/gm, '');

    // Add spacing between sections
    formattedText = formattedText.replace(/(💊\s+\*\*Prescription & Timings\*\*)/g, '\n\n$1');
    formattedText = formattedText.replace(/(🥗\s+\*\*Dietary Guidance\*\*)/g, '\n\n$1');
    formattedText = formattedText.replace(/(🏃‍♂️\s+\*\*Recommended Exercises\*\*)/g, '\n\n$1');
    formattedText = formattedText.replace(/(⚠️\s+\*\*Disclaimer\*\*)/g, '\n\n$1');

    // Convert hyphens to bullets
    formattedText = formattedText.replace(/(\n\s*-\s*)/g, '\n• ');

    // Add a disclaimer if not present (as a fallback)
    if (!formattedText.toLowerCase().includes('disclaimer') && !formattedText.toLowerCase().includes('professional medical advice')) {
      formattedText += '\n\n⚠️ **Disclaimer:** This advice is for informational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider for any health concerns.';
    }

    return formattedText;
  }

  formatMedicalReportResponse(text) {
    let formattedText = text.trim();
    if (!formattedText.startsWith('🔬')) {
      formattedText = `🔬 **Medical Report Analysis Complete**\n\n${formattedText}`;
    }
    if (!formattedText.toLowerCase().includes('consult') && !formattedText.toLowerCase().includes('doctor')) {
      formattedText += '\n\n**⚠️ Important Note:** This analysis is based on your medical report. Always consult healthcare professionals for personalized advice.';
    }
    return formattedText;
  }

  formatPrescriptionResponse(text) {
    let formattedText = text.trim();
    if (!formattedText.startsWith('💊')) {
      formattedText = `💊 **Prescription Analysis Complete**\n\n${formattedText}`;
    }
    if (!formattedText.toLowerCase().includes('consult') && !formattedText.toLowerCase().includes('doctor')) {
      formattedText += '\n\n**⚠️ Important Note:** Always follow your doctor\'s specific instructions. This analysis is for informational purposes only.';
    }
    return formattedText;
  }

  async testConnection() {
    if (!this.isReady()) {
      throw new Error('Gemini API is not initialized');
    }
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: "Hello, this is a test message.",
      });
      return text.length > 0;
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

const geminiAPIService = new GeminiAPIService();
export default geminiAPIService;
