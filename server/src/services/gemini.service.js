import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API;
  if (!apiKey) {
    throw new Error('Gemini API key (GEMINI_API) is not configured in .env');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateEmbedding = async (text) => {
  if (!text || text.trim() === '') {
    return new Array(3072).fill(0);
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    
    const result = await model.embedContent(text);
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    
    throw new Error('No embedding returned from Gemini API.');
  } catch (error) {
    console.error('generateEmbedding error:', error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
};

export const generateChatResponse = async (query, contextChunks) => {
  try {
    const genAI = getGenAI();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    let contextText = '';
    if (contextChunks && contextChunks.length > 0) {
      contextText = contextChunks.map((chunk, index) => {
        return `[Chunk #${index + 1}] File: ${chunk.filePath}\nContent:\n\`\`\`\n${chunk.content}\n\`\`\``;
      }).join('\n\n');
    } else {
      contextText = 'No relevant code chunks found.';
    }

    const systemInstruction = `You are CodePilot.ai, an expert programming assistant.
Your goal is to answer queries about the codebase accurately, using the provided context chunks.
Speak assertively, confidently, and with authority. Avoid hesitant or speculative language like "I think", "maybe", "it seems", "based on my analysis".
Provide direct and concise answers by default. Give details or verbose explanations only when the user explicitly asks for them.
You MUST use standard Markdown formatting (such as hashes ## or ### for headers, bolding **text** for emphasis, bullet points, and code blocks) so the frontend client can render your responses with visual styles. Do not use emojis.`;

    const prompt = `${systemInstruction}

---
CONTEXT CHUNKS:
${contextText}
---

USER QUERY:
${query}

Answer the query step-by-step using the context chunks above:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('generateChatResponse error:', error.message);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
};

export const generateCodebaseSummary = async (filesList, codeSamples) => {
  try {
    const genAI = getGenAI();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a software architect analyzing a codebase.
Generate a concise, professional Markdown overview summary of this repository.

Here is the file structure / list of files in the project:
${JSON.stringify(filesList, null, 2)}

And here are some representative code samples/content from the project:
${codeSamples}

Provide:
### Core Purpose
Explain what this project does and its main tech stack.

### Project Architecture
Briefly describe the directory layout and design patterns used.

### Key Entrypoints & Modules
Mention the main files and their responsibilities.

Use markdown formatting (such as headings, bold text, bullet points) so the client renders it visually. Do not use emojis.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('generateCodebaseSummary error:', error.message);
    return `### CodePilot.ai Analysis Summary
Could not generate full summary: ${error.message}.
Tech Stack detected from files: Express / Node.js. Check repository branches or contents.`;
  }
};

export const generateCodeReview = async (focusArea, codeSamples) => {
  try {
    const genAI = getGenAI();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a senior software engineer performing a code review.
Perform a thorough code review focused on: ${focusArea.toUpperCase()}.

Here are some representative code segments from the codebase:
---
${codeSamples}
---

Provide a detailed review report using Markdown formatting:
### Focus Area Overview
Briefly explain what aspects you evaluated.

### Key Findings
List findings with file and code references.

### Recommended Actions
Actionable suggestions with code blocks where appropriate.

Use standard markdown formatting elements (headings, bold text, lists, and code blocks) so the client renders it visually. Do not use emojis.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('generateCodeReview error:', error.message);
    throw new Error(`Failed to generate code review: ${error.message}`);
  }
};

export const generateDocumentation = async (docType, codeSamples) => {
  try {
    const genAI = getGenAI();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a technical writer drafting documentation for a codebase.
Generate a comprehensive document of type: ${docType.toUpperCase()}.

Here are representative code sections from the codebase:
---
${codeSamples}
---

Structure the document with Markdown:
# ${docType.toUpperCase()} DOCUMENTATION

## Introduction
Overview of the project structures.

## Detailed Specifications
Detail files, functions, inputs, outputs, schemas, endpoints, or layout flows.

## Developer Guide
Guidelines on how to run, use, or extend this part of the project.

Use standard markdown formatting elements (headings, bold text, lists, and code blocks) so the client renders it visually. Do not use emojis.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('generateDocumentation error:', error.message);
    throw new Error(`Failed to generate documentation: ${error.message}`);
  }
};