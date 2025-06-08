const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
  res.render('admin/login', { error: null }); // ✅ important fix
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });

  if (!admin || !admin.isAdmin) {
    return res.render('admin/login', { error: 'Invalid credentials or not an admin' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.render('admin/login', { error: 'Invalid credentials' });
  }

  req.session.admin = {
    _id: admin._id,
    username: admin.username, // or admin.name
    email: admin.email
  };

  res.redirect('/admin/dashboard');
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
      name: { $regex: query, $options: 'i' }
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
  await User.findByIdAndUpdate(req.params.id, { username, email });
  res.redirect('/admin/dashboard');
};

/**
 * GET /admin/users/delete/:id
 */
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
};

/**
 * POST /admin/users/create
 */
exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await new User({ username, email, password: hash }).save();
  res.redirect('/admin/dashboard');
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

