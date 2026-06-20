import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  reviewProjectCode,
  documentProject,
  listRepositories
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/projects', protect, getProjects);
router.post('/projects', protect, createProject);
router.get('/projects/:projectId', protect, getProject);
router.delete('/projects/:projectId', protect, deleteProject);
router.post('/projects/:projectId/review', protect, reviewProjectCode);
router.post('/projects/:projectId/docs', protect, documentProject);

router.get('/repositories', protect, listRepositories);

export default router;
