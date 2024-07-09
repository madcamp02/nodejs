const express = require('express');
const githubController = require('../controllers/githubController');

const router = express.Router();

// Owners and Repos 가져오기
router.get('/sync/owners-repos', githubController.getOwnersAndRepos);

// 특정 repository 데이터를 가져와서 DB에 저장
router.get('/async/repositories/:repo_id', githubController.fetchRepositoryData);

module.exports = router;
