import express from 'express';
import { 
  startGithubAuth, 
  githubCallback, 
  githubAuthPost, 
  logout,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Auth routes (require /auth prefix to match client POST /api/auth/github)
router.post('/auth/github', githubAuthPost);
router.get('/auth/github', startGithubAuth);
router.get('/auth/github/callback', githubCallback);
router.post('/auth/logout', logout);

// Profile routes (no /auth prefix, matches client GET /api/profile)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

export default router;
