const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// User registration (with password for login)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, aadhaar, pan, address } = req.body;
    const emailNormalized = (email || '').toLowerCase().trim();
    const existing = await User.findOne({ email: emailNormalized });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: emailNormalized, phone, passwordHash, aadhaar, pan, address });
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ id: user._id, token, name: user.name });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = (email || '').toLowerCase().trim();
    const admin = await Admin.findOne({ email: emailNormalized });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;


