const express = require('express');
const milestoneController = require('../controllers/milestoneController');

const router = express.Router();

router.get('/sync/:repo_id/milestones', milestoneController.getMilestones);
router.post('/async/milestones', milestoneController.addMilestone);
router.patch('/async/milestones/:milestone_id', milestoneController.editMilestone);

module.exports = router;
