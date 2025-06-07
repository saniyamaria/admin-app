const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => res.render('admin/login');

exports.postLogin = async (req, res) => {
  const admin = await User.findOne({ email: req.body.email, isAdmin: true });
  if (admin && await bcrypt.compare(req.body.password, admin.password)) {
    req.session.adminId = admin._id;
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
};

exports.ensureAdmin = (req, res, next) => {
  if (!req.session.adminId) return res.redirect('/admin/login');
  next();
};

exports.getDashboard = async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.render('admin/dashboard', { users });
};

exports.searchUser = async (req, res) => {
  const users = await User.find({
    username: { $regex: req.body.query, $options: 'i' },
    isAdmin: false
  });
  res.render('admin/dashboard', { users });
};

exports.editUser = async (req, res) => {
  const { username, email } = req.body;
  await User.findByIdAndUpdate(req.params.id, { username, email });
  res.redirect('/admin/dashboard');
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
};

exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await new User({ username, email, password: hash }).save();
  res.redirect('/admin/dashboard');
};
