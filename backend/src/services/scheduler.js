const cron = require('node-cron');
const Schedule = require('../models/Schedule');
const whatsappService = require('./whatsapp');

// Calculate next execution time for a recurring schedule
const calculateNextRun = (baseTimeStr, period) => {
  const date = new Date(baseTimeStr);
  
  // If parsing failed or date is invalid, fallback to current time
  if (isNaN(date.getTime())) {
    return new Date();
  }

  switch (period) {
    case '5_min':
      date.setMinutes(date.getMinutes() + 5);
      break;
    case '15_min':
      date.setMinutes(date.getMinutes() + 15);
      break;
    case '30_min':
      date.setMinutes(date.getMinutes() + 30);
      break;
    case 'hourly':
      date.setHours(date.getHours() + 1);
      break;
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'once':
    default:
      return null;
  }
  return date;
};

// Main background tick execution
const checkAndSendSchedules = async () => {
  const now = new Date();
  const nowISO = now.toISOString();

  try {
    // Find all schedules that are due (next_run_at <= now) and are in pending or active status
    const dueSchedules = await Schedule.find({
      status: { $in: ['pending', 'active'] },
      next_run_at: { $ne: null, $lte: nowISO }
    });

    if (dueSchedules.length > 0) {
      console.log(`[Scheduler] Found ${dueSchedules.length} schedules due for execution at ${nowISO}`);
    }

    for (const schedule of dueSchedules) {
      const { _id: id, admin_id, broadcast_jid, message, period, next_run_at, media } = schedule;
      
      try {
        console.log(`[Scheduler] Attempting to send schedule ID: ${id} to ${broadcast_jid} (Admin ID: ${admin_id})`);
        
        // Deliver message
        await whatsappService.sendMessage(admin_id, broadcast_jid, message, media);

        // Calculate next run if recurring
        if (period === 'once') {
          await Schedule.findByIdAndUpdate(id, {
            status: 'sent',
            last_run_at: nowISO,
            next_run_at: null,
            error_message: null
          });
          console.log(`[Scheduler] Schedule ID: ${id} successfully marked as 'sent'.`);
        } else {
          const nextRun = calculateNextRun(next_run_at, period);
          const nextRunISO = nextRun ? nextRun.toISOString() : null;
          
          await Schedule.findByIdAndUpdate(id, {
            status: 'active',
            last_run_at: nowISO,
            next_run_at: nextRunISO,
            error_message: null
          });
          console.log(`[Scheduler] Recurring Schedule ID: ${id} processed. Next run scheduled for: ${nextRunISO}`);
        }
      } catch (err) {
        console.error(`[Scheduler] Error executing schedule ID ${id}:`, err);

        if (period === 'once') {
          await Schedule.findByIdAndUpdate(id, {
            status: 'failed',
            last_run_at: nowISO,
            next_run_at: null,
            error_message: err.message || 'WhatsApp sending failed'
          });
        } else {
          const nextRun = calculateNextRun(next_run_at, period);
          const nextRunISO = nextRun ? nextRun.toISOString() : null;
          
          await Schedule.findByIdAndUpdate(id, {
            status: 'active',
            last_run_at: nowISO,
            next_run_at: nextRunISO,
            error_message: err.message || 'WhatsApp sending failed'
          });
          console.log(`[Scheduler] Recurring Schedule ID ${id} failed but rescheduled for: ${nextRunISO}`);
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Error running background check:', err);
  }
};

// Start background scheduling loop
const startScheduler = () => {
  console.log('Starting background scheduler (Ticking every minute)...');
  
  // Run every minute at 00 seconds
  cron.schedule('* * * * *', () => {
    checkAndSendSchedules().catch(err => console.error('[Scheduler Cron Error]:', err));
  });

  // Run a quick check 5 seconds after startup
  setTimeout(() => {
    console.log('[Scheduler] Running initial startup check...');
    checkAndSendSchedules().catch(err => console.error('[Scheduler Startup Check Error]:', err));
  }, 5000);
};

module.exports = {
  startScheduler,
  calculateNextRun,
  checkAndSendSchedules
};
