import Project from '../models/project.model.js';
import Message from '../models/message.model.js';
import Repository from '../models/repository.model.js';
import Chunk from '../models/chunk.model.js';

export const getProjectsByUser = async (userId) => {
  try {
    return await Project.find({ userId });
  } catch (error) {
    console.error('getProjectsByUser error:', error.message);
    throw new Error(`Failed to fetch user projects: ${error.message}`);
  }
};

export const getProjectById = async (projectId, userId) => {
  try {
    const query = userId ? { _id: projectId, userId } : { _id: projectId };
    return await Project.findOne(query);
  } catch (error) {
    console.error('getProjectById error:', error.message);
    throw new Error(`Failed to fetch project details: ${error.message}`);
  }
};

export const createNewProject = async (userId, repositoryId, projectName, githubDetails) => {
  try {
    return await Project.create({
      userId,
      repositoryId,
      project_name: projectName,
      ingestionStatus: 'pending',
      github: githubDetails
    });
  } catch (error) {
    console.error('createNewProject error:', error.message);
    throw new Error(`Failed to create project: ${error.message}`);
  }
};

export const updateProjectSummary = async (projectId, summary) => {
  try {
    return await Project.findByIdAndUpdate(projectId, { summary }, { new: true });
  } catch (error) {
    console.error('updateProjectSummary error:', error.message);
    throw new Error(`Failed to update project summary: ${error.message}`);
  }
};

export const updateIngestionStatus = async (projectId, status) => {
  try {
    return await Project.findByIdAndUpdate(projectId, { ingestionStatus: status }, { new: true });
  } catch (error) {
    console.error('updateIngestionStatus error:', error.message);
    throw new Error(`Failed to update ingestion status: ${error.message}`);
  }
};

export const deleteProjectById = async (projectId, userId) => {
  try {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      throw new Error('Project not found or unauthorized.');
    }

    const repositoryId = project.repositoryId;

    await Message.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);

    const otherProjects = await Project.find({ repositoryId });
    if (otherProjects.length === 0) {
      console.log(`Cleaning up repository ${repositoryId} and its chunks as it is no longer referenced.`);
      await Chunk.deleteMany({ repositoryId });
      await Repository.findByIdAndDelete(repositoryId);
    }

    return { success: true };
  } catch (error) {
    console.error('deleteProjectById error:', error.message);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
};
