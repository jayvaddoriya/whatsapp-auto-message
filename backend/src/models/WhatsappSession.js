const mongoose = require('mongoose');

const whatsappSessionSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', unique: true, required: true },
  status: { type: String, default: 'disconnected' },
  qr_code: { type: String, default: null },
  phone_number: { type: String, default: null },
  push_name: { type: String, default: null },
  updated_at: { type: Date, default: Date.now }
});

whatsappSessionSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('WhatsappSession', whatsappSessionSchema);
