import User from '../models/user.model.js';
import { 
  getProjectsByUser, 
  getProjectById, 
  createNewProject, 
  deleteProjectById 
} from '../services/project.service.js';
import { findRepositoryByGithubId, createNewRepository } from '../services/repository.service.js';
import { getChunksByRepository } from '../services/chunk.service.js';
import { runIngestionWorkflow } from '../workflows/ingestion.workflow.js';
import { generateCodeReview, generateDocs } from '../agents/analysis.agent.js';
import { getUserRepositories } from '../services/github.service.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await getProjectsByUser(req.user.userId);
    return res.json({ projects });
  } catch (error) {
    console.error('getProjects controller error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch projects list.' });
  }
};

export const getProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await getProjectById(projectId, req.user.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ project });
  } catch (error) {
    console.error('getProject controller error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve project details.' });
  }
};

export const createProject = async (req, res) => {
  const { githubId, name, fullName, url, branch } = req.body;
  const userId = req.user.userId;

  if (!githubId || !name || !fullName || !url) {
    return res.status(400).json({ error: 'Missing required repository details.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(401).json({ error: 'Authentication missing or GitHub token expired.' });
    }

    let repo = await findRepositoryByGithubId(githubId);
    if (!repo) {
      repo = await createNewRepository(userId, {
        githubId,
        name,
        fullName,
        url,
        branch: branch || 'main'
      });
    }

    const existingProjects = await getProjectsByUser(userId);
    const alreadyConnected = existingProjects.some(p => p.repositoryId.toString() === repo._id.toString());
    if (alreadyConnected) {
      return res.status(400).json({ error: 'This codebase project is already connected.' });
    }

    const project = await createNewProject(
      userId,
      repo._id,
      name,
      {
        name,
        fullName,
        url,
        branch: branch || 'main'
      }
    );

    runIngestionWorkflow(
      project._id,
      repo._id,
      url,
      branch || 'main',
      user.githubAccessToken
    );

    return res.status(201).json({
      message: 'Project connected and indexing started.',
      project
    });

  } catch (error) {
    console.error('createProject controller error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to connect repository project.' });
  }
};

export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    await deleteProjectById(projectId, req.user.userId);
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('deleteProject controller error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to delete project.' });
  }
};

export const reviewProjectCode = async (req, res) => {
  const { projectId } = req.params;
  const { focusArea } = req.body;

  try {
    const project = await getProjectById(projectId, req.user.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const chunks = await getChunksByRepository(project.repositoryId);
    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No code chunks found. Ensure repository ingestion is completed.' });
    }

    const subset = chunks.slice(0, 10);
    const codeSamples = subset.map(c => `File: ${c.filePath}\nContent:\n${c.content.substring(0, 1000)}\n---`).join('\n\n');

    console.log(`Project Controller: Requesting code review for ${project.project_name}...`);
    const report = await generateCodeReview(focusArea || 'general', codeSamples);
    
    return res.json({ report });
  } catch (error) {
    console.error('reviewProjectCode controller error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to generate code review.' });
  }
};

export const documentProject = async (req, res) => {
  const { projectId } = req.params;
  const { docType } = req.body;

  try {
    const project = await getProjectById(projectId, req.user.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const chunks = await getChunksByRepository(project.repositoryId);
    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No code chunks found. Ensure repository ingestion is completed.' });
    }

    const subset = chunks.slice(0, 10);
    const codeSamples = subset.map(c => `File: ${c.filePath}\nContent:\n${c.content.substring(0, 1000)}\n---`).join('\n\n');

    console.log(`Project Controller: Requesting documentation for ${project.project_name}...`);
    const documentation = await generateDocs(docType || 'comprehensive', codeSamples);
    
    return res.json({ documentation });
  } catch (error) {
    console.error('documentProject controller error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to generate documentation.' });
  }
};

export const listRepositories = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.githubAccessToken) {
      return res.status(401).json({ error: 'GitHub session token not found. Please re-authenticate.' });
    }

    const repositories = await getUserRepositories(user.githubAccessToken);
    return res.json({ repositories });
  } catch (error) {
    console.error('listRepositories controller error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch repositories from GitHub.' });
  }
};
