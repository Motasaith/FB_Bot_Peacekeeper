import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Configure OpenAI for OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/Motasaith/FB_Bot_Peacekeeper', // Optional: Your site URL
    'X-Title': 'FB Peacekeeper Bot', // Optional: Your site name
  },
});

const MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

/**
 * Analyzes a comment and generates a reply if necessary.
 * @param {string} commentText - The text of the Facebook comment.
 * @returns {Promise<{is_safe: boolean, reply: string, token: string}>}
 */
export const analyzeComment = async (commentText) => {
  try {
    const prompt = `
      You are "BizReply AI", a professional intelligent virtual assistant for a business page in Pakistan.
      Your goal is to increase engagement, answer questions, and secure sales.

      Analyze this comment: "${commentText}"

      1. Determine the CATEGORY:
         - **LEAD/INTEREST**: User wants to buy or knows price/details.
         - **QUESTION**: General query about product/service.
         - **SUPPORT**: Complaint or help request.
         - **APPRECIATION**: Positive feedback.
         - **SPAM/TROLL**: Irrelevant or toxic.

      2. Draft a **REPLY**:
         - Write a polite, professional response in a mix of Urdu/English (Roman Urdu) if appropriate for the context, or English.
         - Be helpful and concise.
         - Use emojis where appropriate.
         - If SPAM/TROLL, reply: "IGNORE".

      RETURN JSON ONLY:
      {
        "category": "category_name",
        "reply": "Your drafted reply here"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a skilled social media manager. Output strictly in JSON.' },
        { role: 'user', content: prompt }
      ],
    });

    const content = completion.choices[0].message.content;
    let result;
    try {
        // Find JSON in content if mixed with text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
        console.error("AI Response Parse Error:", content);
        // Fallback
        result = { category: 'QUESTION', reply: 'Thanks for your comment! How can we help?' };
    }

    return result;

  } catch (error) {
    console.error("AI Service Error Full Details:", error.response ? error.response.data : error.message);
    // Return safe fallback instead of throwing
    return { category: 'QUESTION', reply: 'IGNORE' };
  }
};
