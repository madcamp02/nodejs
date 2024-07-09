const express = require('express');
const labelController = require('../controllers/labelController');

const router = express.Router();

router.post('/async/labels', labelController.addLabel);
router.patch('/async/labels/:label_id', labelController.editLabel);

module.exports = router;
