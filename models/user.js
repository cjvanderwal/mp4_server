var mongoose = require('mongoose');

var UserSchema    = new mongoose.Schema({
  name: String,
  email: String,
  pendingTasks: [String],
  dateCreated: Date
});

module.exports = mongoose.model('User', UserSchema);
