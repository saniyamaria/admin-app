const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/dashboard', adminController.ensureAdmin, adminController.getDashboard);
router.post('/search', adminController.ensureAdmin, adminController.searchUser);
router.get('/users/edit/:id', adminController.ensureAdmin, adminController.getEditUser);
router.post('/users/edit/:id', adminController.ensureAdmin, adminController.editUser);
router.get('/users/delete/:id', adminController.ensureAdmin, adminController.deleteUser);
router.get('/users/create', adminController.getCreateUser);
router.post('/users/create', adminController.createUser);
router.get('/logout', adminController.logout);

module.exports = router;
