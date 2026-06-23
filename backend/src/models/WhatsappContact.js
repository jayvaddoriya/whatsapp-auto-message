const mongoose = require('mongoose');

const whatsappContactSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  jid: { type: String, required: true },
  name: { type: String, default: null },
  phone_number: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

// Compound unique index matching the SQLite UNIQUE(admin_id, jid)
whatsappContactSchema.index({ admin_id: 1, jid: 1 }, { unique: true });

whatsappContactSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('WhatsappContact', whatsappContactSchema);
