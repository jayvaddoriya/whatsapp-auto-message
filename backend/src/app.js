require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const customBroadcastRoutes = require('./routes/customBroadcastRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super', adminRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/custom-broadcasts', customBroadcastRoutes);

// Health check endpoint for monitoring/UptimeRobot
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Serve static assets in production if they exist locally
const staticPath = path.join(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'healthy', message: 'WhatsApp Auto-Broadcast API Server' });
  });
}

module.exports = app;
