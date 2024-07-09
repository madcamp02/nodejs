const express = require('express');
const issueController = require('../controllers/issueController');

const router = express.Router();

router.post('/async/issues', issueController.addIssue);
router.patch('/async/issues/:issue_id', issueController.editIssue);
router.patch('/async/issues/:issue_id/close', issueController.closeIssue);

module.exports = router;
