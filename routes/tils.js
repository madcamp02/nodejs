const express = require('express');
const tilController = require('../controllers/tilController');

const router = express.Router();

router.get('/sync/:repo_id/TILs', tilController.getTILs);
router.patch('/async/til/:til_id', tilController.editTIL);

module.exports = router;
