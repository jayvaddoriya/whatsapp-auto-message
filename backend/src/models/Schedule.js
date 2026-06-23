const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  broadcast_jid: { type: String, required: true },
  broadcast_name: { type: String, required: true },
  message: { type: String, required: true },
  schedule_date: { type: String, required: true },
  schedule_time: { type: String, required: true },
  period: { type: String, required: true },
  status: { type: String, default: 'pending' },
  next_run_at: { type: String, default: null },
  last_run_at: { type: String, default: null },
  error_message: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

scheduleSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
