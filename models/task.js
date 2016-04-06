var mongoose = require('mongoose');

var TaskSchema    = new mongoose.Schema({
  name: String,
  description: String,
  deadline: Date,
  completed: Boolean,
  assignedUser: String,
  assignedUserName: String,
  dateCreated: Date
});

module.exports = mongoose.model('Task', TaskSchema);
