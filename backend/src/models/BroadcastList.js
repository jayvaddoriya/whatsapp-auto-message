const mongoose = require('mongoose');

const broadcastListSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  jid: { type: String, required: true },
  name: { type: String, required: true },
  recipient_count: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now }
});

// Compound unique index matching the SQLite UNIQUE(admin_id, jid)
broadcastListSchema.index({ admin_id: 1, jid: 1 }, { unique: true });

broadcastListSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('BroadcastList', broadcastListSchema);
