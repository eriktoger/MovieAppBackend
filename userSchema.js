const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  favorites: {
    type: Array,
  }
})

module.exports = User = mongoose.model("user",UserSchema);
