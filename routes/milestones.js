import express from 'express';
import { getMilestones, addMilestone, editMilestone } from '../controllers/milestoneController.js';

const router = express.Router();

router.get('/sync/:repo_id/milestones', getMilestones);
router.post('/async/milestones', addMilestone);
router.patch('/async/milestones/:milestone_id', editMilestone);

export default router;
