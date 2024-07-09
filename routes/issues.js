import express from 'express';
import { addIssue, editIssue, closeIssue } from '../controllers/issueController.js';

const router = express.Router();

router.post('/async/issues', addIssue);
router.patch('/async/issues/:issue_id', editIssue);
router.patch('/async/issues/:issue_id/close', closeIssue);

export default router;
