const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  role: { type: String, enum: ['super_admin', 'admin'], required: true },
  created_at: { type: Date, default: Date.now }
});

// Ensure API responses include `id` and convert `enabled` to 0/1
// for backward compatibility with the frontend
adminSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.enabled = ret.enabled ? 1 : 0;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('Admin', adminSchema);
