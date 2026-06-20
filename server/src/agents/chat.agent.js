import { GoogleGenerativeAI } from '@google/generative-ai';

const getAIModel = () => {
  const apiKey = process.env.GEMINI_API;
  if (!apiKey) {
    throw new Error('Gemini API key (GEMINI_API) is not configured in environment variables.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
};

/**
 * Chat Agent responsible for answering user questions using retrieved context and conversation history.
 */
export const generateAnswer = async (question, chunks = [], history = []) => {
  try {
    const model = getAIModel();

    const contextText = chunks.length > 0 
      ? chunks.map((c, i) => `[File Match #${i + 1}] File Path: ${c.filePath}\nCode Content:\n\`\`\`\n${c.content}\n\`\`\``).join('\n\n')
      : 'No matching code context chunks were found for this query.';

    const historyText = history.length > 0
      ? history.map(msg => `${msg.role === 'user' ? 'User' : 'CodePilot'}: ${msg.content}`).join('\n\n')
      : 'No previous conversation history.';

    const prompt = `You are CodePilot.ai, a software architecture and coding assistant.
Use the codebase context chunks and chat history provided below to answer the user's question.

---
CODEBASE CONTEXT CHUNKS:
${contextText}
---

---
CONVERSATION HISTORY:
${historyText}
---

USER QUESTION:
${question}

Answer the question. Be detailed, precise, and references specific files when suggesting changes. Use markdown formatting. Do not use emojis in your response.`;

    const result = await model.generateContent(prompt);
    if (result && result.response) {
      return result.response.text();
    }
    
    throw new Error('Empty response returned from Gemini.');
  } catch (error) {
    console.error('Chat Agent error:', error.message);
    throw new Error(`Chat Agent failed to generate response: ${error.message}`);
  }
};
