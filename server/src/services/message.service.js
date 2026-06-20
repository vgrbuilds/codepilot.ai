import Message from '../models/message.model.js';

export const getMessagesByProject = async (projectId) => {
  try {
    return await Message.find({ projectId }).sort({ createdAt: 1 });
  } catch (error) {
    console.error('getMessagesByProject error:', error.message);
    throw new Error(`Failed to fetch project messages: ${error.message}`);
  }
};

export const createMessage = async (projectId, role, content, sources = []) => {
  try {
    return await Message.create({
      projectId,
      role,
      content,
      sources
    });
  } catch (error) {
    console.error('createMessage error:', error.message);
    throw new Error(`Failed to log message: ${error.message}`);
  }
};

export const clearMessagesByProject = async (projectId) => {
  try {
    return await Message.deleteMany({ projectId });
  } catch (error) {
    console.error('clearMessagesByProject error:', error.message);
    throw new Error(`Failed to clear chat log: ${error.message}`);
  }
};
