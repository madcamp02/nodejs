import express from 'express';
import { getCommits, getCommitDetails, addIssueToCommit } from '../controllers/commitController.js';

const router = express.Router();

router.get('/sync/:repo_id/commits', getCommits);
router.get('/sync/commits/:commit_id', getCommitDetails);
router.patch('/async/commits/:commit_id/:issue_id', addIssueToCommit);

export default router;
