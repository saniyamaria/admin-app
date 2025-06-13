const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Optional: console.log(adminController); // useful for debugging

router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/dashboard', adminController.ensureAdmin, adminController.getDashboard);
router.post('/search', adminController.ensureAdmin, adminController.searchUser);
router.get('/users/edit/:id', adminController.ensureAdmin, adminController.getEditUser);
router.post('/users/edit/:id', adminController.ensureAdmin, adminController.editUser);
router.get('/users/delete/:id', adminController.ensureAdmin, adminController.deleteUser);
router.get('/users/create', adminController.ensureAdmin, adminController.getCreateUser);
router.post('/users/create', adminController.ensureAdmin, adminController.createUser);
router.get('/logout', adminController.logout);

module.exports = router;
