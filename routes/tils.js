import express from 'express';
import { getTILs, editTIL } from '../controllers/tilController.js';

const router = express.Router();

router.get('/sync/:repo_id/TILs', getTILs);
router.patch('/async/til/:til_id', editTIL);

export default router;
