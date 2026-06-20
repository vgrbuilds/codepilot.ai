import { GoogleGenerativeAI } from '@google/generative-ai';

const getAIModel = (responseJson = false) => {
  const apiKey = process.env.GEMINI_API;
  if (!apiKey) {
    throw new Error('Gemini API key (GEMINI_API) is not configured in environment variables.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const config = responseJson ? { generationConfig: { responseMimeType: 'application/json' } } : {};
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', ...config });
};

/**
 * Analysis Agent responsible for summarizing codebases,
 * running code reviews, and compiling developer documentation.
 */

export const analyzeCodebase = async (filesList, codeSamples) => {
  try {
    const model = getAIModel(true);

    const prompt = `You are a software architect analyzing a codebase.
Analyze the provided repository file list and code samples.

Files list in codebase:
${JSON.stringify(filesList, null, 2)}

Code samples:
${codeSamples}

Return a JSON object containing:
- "summary": A descriptive paragraph summarizing the project's purpose and functionality.
- "stack": An array of tech stack elements, frameworks, and programming languages detected.
- "architecture": A description of the directory layout and architectural patterns.

Return ONLY this JSON schema:
{
  "summary": "string",
  "stack": ["string"],
  "architecture": "string"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Analysis Agent analyzeCodebase error:', error.message);
    return {
      summary: 'A codebase project connected to CodePilot.ai.',
      stack: ['Node.js', 'Express', 'Mongoose'],
      architecture: 'Model-View-Controller or default layout.'
    };
  }
};

export const generateCodeReview = async (focusArea, codeSamples) => {
  try {
    const model = getAIModel(false);

    const prompt = `You are a senior software security and performance engineer.
Conduct a detailed code review focused on: ${focusArea.toUpperCase()}.

Code samples:
---
${codeSamples}
---

Provide a code review report in markdown format. Do not use emojis in your output.
1. **Focus Area Overview**: What aspect you evaluated.
2. **Key Findings**: Code quality, smells, bugs, or security vulnerabilities found.
3. **Recommended Actions**: Clear steps to improve the code.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Analysis Agent generateCodeReview error:', error.message);
    throw new Error(`Failed to compile code review: ${error.message}`);
  }
};

export const generateDocs = async (docType, codeSamples) => {
  try {
    const model = getAIModel(false);

    const prompt = `You are a technical writer drafting developer documents.
Generate a comprehensive document of type: ${docType.toUpperCase()}.

Code samples:
---
${codeSamples}
---

Structure the document with Markdown. Do not use emojis in your output.
- **Title**: Document header.
- **Introduction**: Description of the systems.
- **Detailed Specifications**: Endpoints, schemas, inputs, outputs, or layout modules.
- **Onboarding Guide**: Instructions to work on these code files.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Analysis Agent generateDocs error:', error.message);
    throw new Error(`Failed to compile documentation: ${error.message}`);
  }
};
