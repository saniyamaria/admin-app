const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/home', userController.ensureAuth, userController.getHome);
router.get('/profile', userController.ensureAuth, userController.getProfile);
router.post('/profile', userController.ensureAuth, userController.updateProfile);

router.get('/logout', userController.logout);

module.exports = router;
