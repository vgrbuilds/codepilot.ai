import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import Repository from '../models/repository.model.js';
import Chunk from '../models/chunk.model.js';
import Message from '../models/message.model.js';
import { exchangeCodeForToken, getGithubProfile } from '../services/github.service.js';

export const startGithubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URL || 'http://localhost:8000/api/auth/github/callback';

  if (!clientId) {
    return res.status(500).json({ error: 'GitHub Client ID is not configured.' });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=read:user,user:email`;

  return res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!code) {
    return res.status(400).redirect(`${clientUrl}/login?error=code_missing`);
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await getGithubProfile(accessToken);

    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        githubUsername: profile.username,
        githubAccessToken: accessToken
      });
    } else {
      user.githubAccessToken = accessToken;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, githubId: user.githubId },
      process.env.JWT_SECRET || 'super_sercret_key',
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.redirect(clientUrl);
  } catch (error) {
    console.error('OAuth callback error:', error.message);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};

export const githubAuthPost = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing.' });
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await getGithubProfile(accessToken);

    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        githubUsername: profile.username,
        githubAccessToken: accessToken
      });
    } else {
      user.githubAccessToken = accessToken;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, githubId: user.githubId },
      process.env.JWT_SECRET || 'super_sercret_key',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        githubId: user.githubId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('githubAuthPost error:', error.message);
    return res.status(500).json({ error: error.message || 'GitHub OAuth verification failed.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('getProfile error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    return res.json({ user });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const repos = await Repository.find({ userId });
    const repoIds = repos.map(r => r._id);
    const projects = await Project.find({ userId });
    const projectIds = projects.map(p => p._id);

    await Message.deleteMany({ projectId: { $in: projectIds } });
    await Chunk.deleteMany({ repositoryId: { $in: repoIds } });
    await Project.deleteMany({ userId });
    await Repository.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie('token');
    return res.json({ success: true, message: 'User account and data cleared.' });
  } catch (error) {
    console.error('deleteAccount error:', error.message);
    return res.status(500).json({ error: 'Failed to delete user account.' });
  }
};
