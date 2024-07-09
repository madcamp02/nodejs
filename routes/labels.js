import express from 'express';
import { addLabel, editLabel } from '../controllers/labelController.js';

const router = express.Router();

router.post('/async/labels', addLabel);
router.patch('/async/labels/:label_id', editLabel);

export default router;
