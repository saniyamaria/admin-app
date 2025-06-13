const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  console.log('Email:', email);
  console.log('Password:', password);

  const hardcodedEmail = 'admin@gmail.com';
  const hardcodedPassword = 'admin123';

  if (email !== hardcodedEmail || password !== hardcodedPassword) {
    return res.render('admin/login', { error: 'Invalid admin credentials' });
  }

  req.session.admin = {
    email: hardcodedEmail,
    username: 'Admin'
  };

  return res.redirect('/admin/dashboard');
};
exports.getLogin = (req, res) => {
  res.render('admin/login', { error: null });
};



/**
 * Middleware to protect admin routes
 */
exports.ensureAdmin = (req, res, next) => {
  if (!req.session.admin || !req.session.admin._id) {
    return res.redirect('/admin/login');
  }
  next();
};

/**
 * GET /admin/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const query = req.query.search || '';
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
    });
    res.render('admin/dashboard', {
      users,
      searchTerm: query,
      admin: req.session.admin,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


/**
 * POST /admin/search (if used separately)
 */
exports.searchUser = async (req, res) => {
  const users = await User.find({
    username: { $regex: req.body.query, $options: 'i' },
    isAdmin: false
  });
  res.render('admin/dashboard', {
  users,
  searchTerm: req.body.query,
  admin: req.session.admin,
  error: null // ✅ add this
});
};

/**
 * POST /admin/users/edit/:id
 */
exports.editUser = async (req, res) => {
  const { username, email } = req.body;
  const isAdmin = req.body.isAdmin === 'on'; // checkbox returns 'on' if checked

  await User.findByIdAndUpdate(req.params.id, {
    username,
    email,
    isAdmin
  });

  res.redirect('/admin/dashboard');
};


exports.getEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.redirect('/admin/dashboard');
    }
    res.render('admin/edit', { user });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
};


exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isAdmin = req.body.isAdmin === 'on'; // checkbox returns 'on' if checked

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('admin/create', { error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    await new User({ username, email, password: hash, isAdmin }).save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/create', { error: 'Error creating user' });
  }
};

exports.getCreateUser = (req, res) => {
  res.render('admin/create', { error: null });
};

/**
 * GET /admin/logout
 */
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/admin/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};

