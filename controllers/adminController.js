const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => res.render('admin/login');

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

  // ✅ Store admin session
  req.session.admin = {
    _id: admin._id,
    username: admin.username, // or admin.name
    email: admin.email
  };

  res.redirect('/admin/dashboard');
};


exports.ensureAdmin = (req, res, next) => {
  if (!req.session.adminId) return res.redirect('/admin/login');
  next();
};

exports.getDashboard = async (req, res) => {
  try {
    const query = req.query.search || '';
    const users = await User.find({
      name: { $regex: query, $options: 'i' }
    });

    res.render('admin/dashboard', {
      users,
      searchTerm: query,
      admin: req.session.admin // ✅ this is what your EJS expects
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
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

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.redirect('/admin/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};
