const mongoose = require('mongoose');

const customBroadcastSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  name: { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now }
});

customBroadcastSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('CustomBroadcast', customBroadcastSchema);
