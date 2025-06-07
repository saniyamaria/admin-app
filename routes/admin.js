const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/dashboard', adminController.ensureAdmin, adminController.getDashboard);
router.post('/search', adminController.ensureAdmin, adminController.searchUser);
router.post('/edit/:id', adminController.ensureAdmin, adminController.editUser);
router.post('/delete/:id', adminController.ensureAdmin, adminController.deleteUser);
router.post('/create', adminController.ensureAdmin, adminController.createUser);

module.exports = router;
