import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/Motasaith/FB_Bot_Peacekeeper',
    'X-Title': 'FB Peacekeeper Bot',
  },
});

const MODEL = 'google/gemini-2.0-flash-exp:free';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeComment = async (commentText, mode = 'peacekeeper', isMainPost = false) => {
  const MAX_RETRIES = 5;
  let attempt = 0;

  // --- PROMPT LIBRARY ---
  const PROMPTS = {
    business: `
      You are "BizReply AI", a helpful sales assistant.
      Your Goal: Secure leads, answer questions, and be polite.
      ${isMainPost ? "CONTEXT: This is the MAIN CAPTION of a post. Write a comment to engage with the post." : "CONTEXT: This is a user comment."}
      
      1. CATEGORIZE: LEAD, QUESTION, SUPPORT, SPAM.
      2. REPLY: Helpful, sales-focused, polite. If SPAM, reply "IGNORE".
    `,
    peacekeeper: `
      You are a FACTUAL, LOGICAL PEACEKEEPER. 
      Your Goal: Correct misinformation and counter hate speech (especially anti-religious/Islamophobic) with calm facts.
      ${isMainPost ? "CONTEXT: This is the MAIN CAPTION of a post. Analyze it for hate/misinfo." : "CONTEXT: This is a user comment."}
      
      1. CATEGORIZE: HATE_SPEECH, MISINFORMATION, NEUTRAL, QUESTION.
      2. REPLY: 
         - If HATE: Counter with logic/facts. Be calm.
         - If MISINFO: Correct it.
         - If NEUTRAL/AGREE: Reply "IGNORE" (unless it's the Main Post, then agree politely).
    `
  };

  const selectedSystemPrompt = PROMPTS[mode] || PROMPTS['peacekeeper'];

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      const prompt = `
        ${selectedSystemPrompt}
        
        Analyze this text: "${commentText}"
        
        RETURN JSON ONLY: { "category": "...", "reply": "..." }
      `;

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { category: 'NEUTRAL', reply: 'IGNORE' };

    } catch (error) {
      if (error.status === 503 || error.status === 429) {
         console.warn(`[AI] Retry ${attempt}...`);
         await delay(2000 * attempt); 
      } else {
         return { category: 'ERROR', reply: 'IGNORE' };
      }
    }
  }
};
