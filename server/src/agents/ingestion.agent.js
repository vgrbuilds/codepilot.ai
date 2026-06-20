import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { generateEmbedding } from '../services/gemini.service.js';

/**
 * Ingestion Agent responsible for code parsing, chunking, and embedding.
 * Uses LangChain RecursiveCharacterTextSplitter.
 */
export const splitAndEmbedFile = async (filePath, fileContent) => {
  try {
    if (!fileContent || fileContent.trim() === '') {
      return [];
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 300
    });

    const chunkTexts = await splitter.splitText(fileContent);

    const chunks = [];
    for (let i = 0; i < chunkTexts.length; i++) {
      const chunkText = chunkTexts[i];
      const embedding = await generateEmbedding(chunkText);
      
      chunks.push({
        content: chunkText,
        embedding,
        metadata: {
          chunkIndex: i,
          length: chunkText.length
        }
      });
    }

    return chunks;
  } catch (error) {
    console.error(`Ingestion Agent error for ${filePath}:`, error.message);
    throw new Error(`Failed to parse and vectorize file ${filePath}: ${error.message}`);
  }
};
