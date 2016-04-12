// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var user = require('./models/user');
var task = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://cjvanderwal:password@ds025459.mlab.com:25459/cs498_mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST,HEAD, OPTIONS,PUT, DELETE");
  next();
};
app.use(allowCrossDomain);


// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// All our routes will start with /api
app.use('/api', router);


// helper function to parse the request string for the database call
function addOptions(req) {
  var sort = {};
  var skip = {};
  var limit = {};
  var select = {};
  var count = {};
  if (typeof(req.query.sort) != "undefined") {sort = JSON.parse(req.query.sort);}
  if (typeof(req.query.skip) != "undefined") {skip = JSON.parse(req.query.skip);}
  if (typeof(req.query.limit) != "undefined") {limit = JSON.parse(req.query.limit);}
  if (typeof(req.query.select) != "undefined") {select = JSON.parse(req.query.select);}
  if (typeof(req.query.count) != "undefined") {count = JSON.parse(req.query.count);}
  var options = {
    "sort":sort,
    "skip":skip,
    "limit":limit,
    "select":select,
    "count":count
  };

  return options;
}


//Default route
var homeRoute = router.route('/');
homeRoute.get(function(req, res) {
  res.json({ message: "Nothing here. Go to /users or /tasks to play with the API.", data: [] });
});


//User route
var userRoute = router.route('/users');

//GET
userRoute.get(function(req, res) {
  var options = addOptions(req);
  var id = {};
  var fields = {};
  if (typeof(req.query.where) != "undefined") {id = JSON.parse(req.query.where);}
  if (typeof(req.query.fields) != "undefined") {fields = JSON.parse(req.query.fields);}

  user.find(id, fields, options, function(err, users) {
    if (err) {
      res.status(500);
      res.json({message: "We don't know what happened!", data: []});
      return;
    }

    res.json({message:"OK", data:users});
  });
});

//POST
userRoute.post(function(req, res) {

  if (!req.body.name || !req.body.email) {
      var message = 'Validation error:';
      if (!req.body.name)
        message += ' A name is required!';
      if (!req.body.email)
        message += ' An email is required!';

    res.status(500);
    res.json({message: message, data: []});
    return;
  }

  user.create(req.body, function(err, user) {
    if (err) {
      res.status(500);
      res.json({message: "This email already exists", data:[]});
      return;
    }

    res.status(201);
    res.json({ message: 'User added', data:user });
  });
});

//OPTIONS
userRoute.options(function(req, res){
  res.writeHead(200);
  res.end();
});

//Specific User route
var userIDRoute = router.route('/users/:userid');

//GET
userIDRoute.get(function(req, res) {
  user.findById(req.params.userid, function(err, user) {
    if (err || user === null) {
      res.status(404);
      res.json({message: "User not found", data: []});
      return;
    }

    res.json({message: "OK", data:user});
  });
});

//PUT
userIDRoute.put(function(req, res) {

  // actually update the user
  user.findByIdAndUpdate(req.params.userid, req.body, function(err, user) {
    if (err) {
      if (err.name == "MongoError") {
        res.status(500);
        res.json({message:"This email already exists", data: []});
      }
      else {
        res.status(404);
        res.json({message:"User not found", data: []});
      }
      return;
    }

    // make sure the required parameters are present
    if (!req.body.name || req.body.name === "" || !req.body.email || req.body.email === "") {
        var message = 'Validation error:';
        if (!req.body.name || req.body.name === "")
          message += ' A name is required!';
        if (!req.body.email || req.body.email === "")
          message += ' An email is required!';

      res.status(500);
      res.json({message: message, data: []});
      return;
    }

    res.json({ message: 'User updated', data:req.body});
  });
});

//DELETE
userIDRoute.delete(function(req, res) {

  user.findByIdAndRemove(req.params.userid, function(err, user) {
    if (err || user === null) {
      res.status(404);
      res.json({message: "User not found", data: []});
      return;
    }

  res.json({ message: 'User deleted', data:user });
  });
});


//Task route
var taskRoute = router.route('/tasks');

//GET
taskRoute.get(function(req, res) {
  var options = addOptions(req);
  var id = {};
  var fields = {};
  if (typeof(req.query.where) != "undefined") {id = JSON.parse(req.query.where);}
  if (typeof(req.query.fields) != "undefined") {fields = JSON.parse(req.query.fields);}

  task.find(id, fields, options, function(err, tasks) {
    if (err) {
      res.status(404);
      res.json({message:"Task not found", data:[]});
      return;
    }

    res.json({message:"OK", data:tasks});
  });
});

//POST
taskRoute.post(function(req, res) {

  if (!req.body.name || !req.body.deadline) {
    var message = 'Validation error:';
    if (!req.body.name)
      message += ' A name is required!';
    if (!req.body.deadline)
      message += ' A deadline is required!';

    res.status(500);
    res.json({message: message, data: []});
    return;
  }

  task.create(req.body, function(err, task) {
    if(err){
      res.status(500);
      res.json({message:"We don't know what happened!", data: []});
    }

    res.status(201);
    res.json({ message: 'Task added', data:task });
  });
});

//OPTIONS
taskRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});


//Specific task route
var taskIDRoute = router.route('/tasks/:taskid');

//GET
taskIDRoute.get(function(req, res) {
  task.findById(req.params.taskid, function(err, task) {
    if (err || task === null) {
      res.status(404);
      res.json({message: "Task not found", data:[]});
      return;
    }

    res.json({message: "OK", data:task});
  });
});

//PUT
taskIDRoute.put(function(req, res) {

  task.findByIdAndUpdate(req.params.taskid, req.body, function(err, task) {
    if (err || task === null) {
      res.status(404);
      res.json({message:"Task not found", data: []});
      return;
    }

    if (!req.body.name || !req.body.deadline) {
      var message = 'Validation error:';
      if (!req.body.name)
        message += ' A name is required!';
      if (!req.body.deadline)
        message += ' A deadline is required!';

      res.status(500);
      res.json({message: message, data: []});
      return;
    }

    res.json({ message: 'Task updated', data:req.body});
  });
});

//DELETE
taskIDRoute.delete(function(req, res) {
  task.findByIdAndRemove(req.params.taskid, function(err, task) {
    if (err || task === null) {
      res.status(404);
      res.json({message:"Task not found", data:[]});
      return;
    }

  res.json({ message: 'Task deleted', data:[] });
  });
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
