const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema({
  msg_id: { type: String, required: true, unique: true },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  remote_jid: { type: String, required: true },
  message_json: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

whatsappMessageSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('WhatsappMessage', whatsappMessageSchema);
