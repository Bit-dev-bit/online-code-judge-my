const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.post('/', submissionController.submitCode);
router.get('/', submissionController.getSubmissions);

module.exports = router;
