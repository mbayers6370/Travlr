const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  // bcrypt embeds the salt in this value. `salt` remains for assignment schema compatibility.
  hash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }
}, { timestamps: true, collection: 'users' });

userSchema.methods.setPassword = async function setPassword(password) {
  this.hash = await bcrypt.hash(password, SALT_ROUNDS);
  // This is copied from bcrypt's generated hash; no separate salt is generated or used.
  this.salt = this.hash.slice(0, 29);
};

userSchema.methods.validPassword = async function validPassword(password) {
  return bcrypt.compare(password, this.hash);
};

module.exports = mongoose.model('User', userSchema);
