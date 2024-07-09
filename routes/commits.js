const express = require('express');
const commitController = require('../controllers/commitController');

const router = express.Router();

router.get('/sync/:repo_id/commits', commitController.getCommits);
router.get('/sync/commits/:commit_id', commitController.getCommitDetails);
router.patch('/async/commits/:commit_id/:issue_id', commitController.addIssueToCommit);

module.exports = router;
