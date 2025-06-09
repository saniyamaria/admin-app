const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getSignup = (req, res) => res.render('users/signup');
exports.postSignup = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await new User({ username, email, password: hash }).save();
  res.redirect('/user/login');
};

exports.getLogin = (req, res) => res.render('users/login', { error: null });
exports.postLogin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.userId = user._id;
    return res.redirect('/user/home');
  }

  res.render('users/login', { error: 'Incorrect email or password' });
};


exports.ensureAuth = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/user/login');
  next();
};

exports.getHome = async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('users/home', { user });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('users/profile', { user });
};

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  await User.findByIdAndUpdate(req.session.userId, { username, email });
  res.redirect('/user/profile');
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.redirect('/user/home');
    }
    res.clearCookie('connect.sid');
    res.redirect('/user/login');
  });
};
