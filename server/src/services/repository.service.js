import Repository from '../models/repository.model.js';

export const findRepositoryByGithubId = async (githubId) => {
  try {
    return await Repository.findOne({ githubId });
  } catch (error) {
    console.error('findRepositoryByGithubId error:', error.message);
    throw new Error(`Failed to find repository: ${error.message}`);
  }
};

export const createNewRepository = async (userId, repoDetails) => {
  try {
    return await Repository.create({
      userId,
      githubId: repoDetails.githubId,
      name: repoDetails.name,
      fullName: repoDetails.fullName,
      url: repoDetails.url,
      branch: repoDetails.branch || 'main',
      status: 'pending'
    });
  } catch (error) {
    console.error('createNewRepository error:', error.message);
    throw new Error(`Failed to create repository: ${error.message}`);
  }
};

export const updateRepositoryStatus = async (repositoryId, status) => {
  try {
    return await Repository.findByIdAndUpdate(repositoryId, { status }, { new: true });
  } catch (error) {
    console.error('updateRepositoryStatus error:', error.message);
    throw new Error(`Failed to update repository status: ${error.message}`);
  }
};