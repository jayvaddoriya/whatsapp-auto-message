const mongoose = require('mongoose');

const customBroadcastNumberSchema = new mongoose.Schema({
  broadcast_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomBroadcast', required: true },
  phone_number: { type: String, required: true }
});

// Index for fast lookups by broadcast_id
customBroadcastNumberSchema.index({ broadcast_id: 1 });

customBroadcastNumberSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('CustomBroadcastNumber', customBroadcastNumberSchema);
