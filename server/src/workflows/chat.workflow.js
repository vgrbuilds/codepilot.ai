import { getProjectById } from '../services/project.service.js';
import { getSimilarChunks } from '../services/chunk.service.js';
import { createMessage, getMessagesByProject } from '../services/message.service.js';
import { generateEmbedding } from '../services/gemini.service.js';
import { generateAnswer } from '../agents/chat.agent.js';
import User from '../models/user.model.js';

/**
 * Chat Workflow orchestrating query embedding, similarity chunk search,
 * assistant generation, and conversation logging.
 */
export const runChatWorkflow = async (projectId, query) => {
  try {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const repositoryId = project.repositoryId;
    const history = await getMessagesByProject(projectId);
    const queryEmbedding = await generateEmbedding(query);
    const topChunks = await getSimilarChunks(repositoryId, queryEmbedding, 6);

    console.log('Chat Workflow: Invoking Chat Agent...');
    const replyText = await generateAnswer(query, topChunks, history);

    await createMessage(projectId, 'user', query);

    const assistantMessage = await createMessage(
      projectId,
      'assistant',
      replyText,
      topChunks.map(c => ({
        filePath: c.filePath,
        chunkId: c._id.toString()
      }))
    );

    await User.findByIdAndUpdate(project.userId, {
      $inc: { 'stats.questionsAsked': 1 }
    });

    return assistantMessage;

  } catch (error) {
    console.error('Chat Workflow error:', error.message);
    throw new Error(`Chat Workflow failed: ${error.message}`);
  }
};
