import { getMessagesByProject, clearMessagesByProject } from '../services/message.service.js';
import { getProjectById } from '../services/project.service.js';
import { runChatWorkflow } from '../workflows/chat.workflow.js';

export const getMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await getProjectById(projectId, req.user.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project workspace not found.' });
    }

    const messages = await getMessagesByProject(projectId);
    return res.json({ messages });
  } catch (error) {
    console.error('getMessages controller error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve conversation logs.' });
  }
};

export const sendMessage = async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Query content cannot be empty.' });
  }

  try {
    const project = await getProjectById(projectId, req.user.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project workspace not found.' });
    }

    if (project.ingestionStatus !== 'completed') {
      return res.status(400).json({ error: 'Codebase must be fully ingested before you can chat.' });
    }

    console.log(`Chat Controller: Sending query to Chat Workflow for project ${projectId}...`);
    const assistantMessage = await runChatWorkflow(projectId, content);

    return res.status(201).json({ message: assistantMessage });
  } catch (error) {
    console.error('sendMessage controller error:', error.message);
    return res.status(500).json({ error: error.message || 'Chat assistant failed to respond.' });
  }
};

export const clearMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await getProjectById(projectId, req.user.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project workspace not found.' });
    }

    await clearMessagesByProject(projectId);
    return res.json({ success: true, message: 'Conversation logs cleared successfully.' });
  } catch (error) {
    console.error('clearMessages controller error:', error.message);
    return res.status(500).json({ error: 'Failed to clear conversation logs.' });
  }
};
