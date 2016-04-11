var mongoose = require('mongoose');

var UserSchema    = new mongoose.Schema({
  name: {type:String, required:true},
  email: {type:String, required:true, unique:true},
  pendingTasks: {type:[String], default: []},
  dateCreated: {type:Date, default: Date.now}
});

module.exports = mongoose.model('user', UserSchema);
