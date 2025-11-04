const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
// Serve uploaded files statically for preview
app.use('/uploads', express.static(require('path').join(__dirname, '../../', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'kyc-backend' });
});

// Routes
app.use('/api', require('./routes/auth.routes'));
app.use('/api', require('./routes/user.routes'));
app.use('/api', require('./routes/admin.routes'));
app.use('/api', require('./routes/upload.routes'));

// Serve frontend production build if present
const path = require('path');
const fs = require('fs');
const frontDistBase = path.join(__dirname, '../../', 'frontend', 'dist', 'frontend');
// Some Angular builds place files directly in dist/frontend, others under dist/frontend/browser
let frontDistPath = frontDistBase;
const browserSub = path.join(frontDistBase, 'browser');
if (fs.existsSync(browserSub)) frontDistPath = browserSub;

if (fs.existsSync(frontDistPath)) {
  app.use(express.static(frontDistPath));

  // SPA fallback: serve index.html for non-API routes (Express 5 compatible)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontDistPath, 'index.html'));
  });
}

// DB connect and start
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sruthi:bilak1234@cluster0.jcbn59m.mongodb.net/kyc?retryWrites=true&w=majority";
async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


