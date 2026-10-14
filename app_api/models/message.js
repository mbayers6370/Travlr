const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  kind: { type: String, enum: ['trip', 'room', 'contact'], required: true },
  subject: { type: String, trim: true, default: '' },
  tripCode: { type: String, trim: true, default: '' },
  tripName: { type: String, trim: true, default: '' },
  roomName: { type: String, trim: true, default: '' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  travelers: { type: Number, min: 1 },
  preferredDate: { type: Date },
  message: { type: String, trim: true, default: '' },
  isRead: { type: Boolean, default: false }
}, { collection: 'messages', timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
