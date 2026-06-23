const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const scheduler = require('./services/scheduler');
const whatsapp = require('./services/whatsapp');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed default Super Admin if none exists
    await seedAdmin();

    // 3. Start background scheduler cron job
    scheduler.startScheduler();

    // 4. Restore any previously active WhatsApp connections
    await whatsapp.initAllSessions();

    // 5. Start listening
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`Server running on port ${PORT}...`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
