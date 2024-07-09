import express from 'express';
import { getOwnersAndRepos, fetchRepositoryData } from '../controllers/repoController.js';

const router = express.Router();

// Owners and Repos 가져오기
router.get('/sync/owners-repos', getOwnersAndRepos);

// 특정 repository 데이터를 가져와서 DB에 저장
router.get('/async/repositories/:repo_id', fetchRepositoryData);

export default router;
