const express = require('express');
const matchController = require('../controllers/match');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// All match routes require user authentication
router.use(userAuth);

// Create New Resume Match
router.post('/create', matchController.createMatch);

module.exports = router;