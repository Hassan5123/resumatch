const express = require('express');
const userController = require('../controllers/user');
const userAuth = require('../middleware/userAuth');
const router = express.Router();

router.post('/register', userController.register);

router.post('/login', userController.login);

module.exports = router;