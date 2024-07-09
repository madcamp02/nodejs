const express = require('express');
const repoController = require('../controllers/repoController.js'); // Ensure proper CommonJS import

const router = express.Router();

// Owners and Repos 가져오기
// router.get('/fetch/owners-repos', repoController.fetchOwnersAndRepos);
router.get('/retrieve/owners-repos', repoController.retrieveOwnersAndRepos);

// 특정 repository 데이터를 가져와서 DB에 저장
// router.get('/async/repositories/:repo_id', githubController.fetchRepositoryData);

module.exports = router;
