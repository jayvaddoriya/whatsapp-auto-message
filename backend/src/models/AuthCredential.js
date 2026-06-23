const mongoose = require('mongoose');

const authCredentialSchema = new mongoose.Schema({
  // Which admin this credential belongs to
  admin_id: {
    type: String,
    required: true,
    index: true
  },
  // The credential key/filename (e.g., 'creds', 'pre-key-1', 'session-abc', etc.)
  key: {
    type: String,
    required: true
  },
  // The credential data stored as JSON string
  value: {
    type: String,
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: one entry per admin per key
authCredentialSchema.index({ admin_id: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('AuthCredential', authCredentialSchema);
