const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  imageUrl: String,
  publicId: String,
  description: String
}, {versionKey: false});

const User = mongoose.model('users', userSchema);

module.exports = User;