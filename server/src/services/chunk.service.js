import Chunk from '../models/chunk.model.js';

// Calculate cosine similarity between two numeric vectors
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Bulk saves a list of code chunks to MongoDB.
 */
export const saveChunks = async (chunksData) => {
  try {
    if (!chunksData || chunksData.length === 0) return [];
    return await Chunk.insertMany(chunksData);
  } catch (error) {
    console.error('saveChunks error:', error.message);
    throw new Error(`Failed to save code chunks: ${error.message}`);
  }
};

/**
 * Retrieves all chunks for a specific repository.
 */
export const getChunksByRepository = async (repositoryId) => {
  try {
    return await Chunk.find({ repositoryId }).select('filePath language content embedding metadata');
  } catch (error) {
    console.error('getChunksByRepository error:', error.message);
    throw new Error(`Failed to fetch chunks: ${error.message}`);
  }
};

/**
 * Deletes all chunks for a specific repository.
 */
export const deleteChunksByRepository = async (repositoryId) => {
  try {
    return await Chunk.deleteMany({ repositoryId });
  } catch (error) {
    console.error('deleteChunksByRepository error:', error.message);
    throw new Error(`Failed to delete chunks: ${error.message}`);
  }
};

/**
 * Retrieves similar chunks using in-memory cosine similarity calculation.
 */
export const getSimilarChunks = async (repositoryId, queryEmbedding, limit = 6) => {
  try {
    const chunks = await getChunksByRepository(repositoryId);
    
    if (chunks.length === 0) return [];

    const scoredChunks = chunks.map(chunk => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return { chunk, score };
    });

    // Sort by similarity score in descending order
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return the top matched chunks
    return scoredChunks.slice(0, limit).map(item => item.chunk);
  } catch (error) {
    console.error('getSimilarChunks error:', error.message);
    throw new Error(`Failed to find similar chunks: ${error.message}`);
  }
};
