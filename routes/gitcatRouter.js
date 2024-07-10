const express = require('express');
const repoController = require('../controllers/repoController.js'); // Ensure proper CommonJS import
const mlstnController = require('../controllers/mlstnController.js'); // Ensure proper CommonJS import
const commitController = require('../controllers/commitController.js'); // Ensure proper CommonJS import
const tilController = require('../controllers/tilController.js'); // Ensure proper CommonJS import


const router = express.Router();

// Owners and Repos 가져오기
// router.get('/fetch/owners-repos', repoController.fetchOwnersAndRepos);
router.get('/retrieve/owners-repos', repoController.retrieveOwnersAndRepos);

// 특정 repository 데이터를 가져와서 DB에 저장
// router.get('/async/repositories/:repo_id', githubController.fetchRepositoryData);
router.get('/retrieve/mlstns-issues-labels', mlstnController.retrieveMlstnsIssuesLabels);

// 깃허브에서 커밋 가져오기
router.get('/retrieve/commits', commitController.retrieveCommits);

// 프론트로 커밋 보내기
// router.get('/fetch/commits', commitController.fetchCommits);

// 프론트로 til 보내기
router.get('/fetch/tils', tilController.fetchTils);

router.get('/fetch/single-til', tilController.fetchSingleTil);

router.patch('/patch/til', tilController.patchTil);

module.exports = router;
