// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Task = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://cjvanderwal:uiuccs498@ds021979.mlab.com:21979/cs498_mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);



//Default route
var homeRoute = router.route('/');
homeRoute.get(function(req, res) {
  res.json({ message: "Nothing here. Go to /users or /tasks to play with the API.", data: [] });
});


//User route
var userRoute = router.route('/users');

//GET
userRoute.get(function(req, res) {
  var options = {
    // "skip": req.query.skip,
    // "limit": req.query.limit,
    // "sort": req.query.sort
    // "select": JSON.parse(req.query.select),
    // "count": JSON.parse(req.query.count)
  };
  User.find(options, function(err, users) {
    if (err)
      res.send(err);

    res.json({message:"OK", data:users});
    // res.json({message:"OK", data:users.filter(search(req.query))});
    // res.json({message:"OK", data:req.query, length: Object.keys(req.query).length});
  });
});

//POST
userRoute.post(function(req, res) {
  var user = new User();

  if (!req.body.name || !req.body.email) {
    res.json({message: 'Validation error! A name is required! An email is required!', data: []});
    return;
  }

  user.name = req.body.name;
  user.email = req.body.email;
  user.pendingTasks = [];
  user.dateCreated = new Date();

  user.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'User added to database', data:user });
  });
});

//OPTIONS
userRoute.options(function(req, res){
  res.writeHead(200);
  res.end();
});


//Specific User route
var userIDRoute = router.route('/users/:user_id');

//GET
userIDRoute.get(function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      red.send(err);

    res.json({message: "OK", data:user});
  });
});

//PUT
userIDRoute.put(function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      red.send(err);

    if (!req.body.name || !req.body.email) {
      res.json({message: 'Validation error! A name is required! An email is required!', data: []});
      return;
    }

    user.name = req.body.name;
    user.email = req.body.email;

    user.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'User updated', data:user });
    });
  });
});

//DELETE
userIDRoute.delete(function(req, res) {
  User.remove({_id:req.params.user_id}, function(err, user) {
    if (err)
      res.send(err);

  res.json({ message: 'User deleted', data:[] });
  });
});


//Task route
var taskRoute = router.route('/tasks');

//GET
taskRoute.get(function(req, res) {
  Task.find(function(err, tasks) {
    if (err)
      res.send(err);

    res.json({message:"OK", data:tasks});
  });
});

//POST
taskRoute.post(function(req, res) {
  var task = new Task();

  if (!req.body.name || !req.body.deadline) {
    res.json({message: 'Validation error! A name is required! A deadline is required!', data: []});
    return;
  }

  task.name = req.body.name;
  task.deadline = req.body.deadline;
  task.completed = false;
  task.dateCreated = new Date();
  task.assignedUser = "";

  task.assignedUserName = "unassigned";
  if (req.body.assignedUserName)
    task.assignedUserName = req.body.assignedUserName;

  task.description = "";
  if (req.body.description)
    task.description = req.body.description;

  task.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Task added to database', data:task });
  });
});

//OPTIONS
taskRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});


//Specific task route
var taskIDRoute = router.route('/tasks/:task_id');

//GET
taskIDRoute.get(function(req, res) {
  Task.findById(req.params.task_id, function(err, task) {
    if (err)
      red.send(err);

    res.json({message: "OK", data:task});
  });
});

//PUT
taskIDRoute.put(function(req, res) {
  Task.findById(req.params.task_id, function(err, task) {
    if (err)
      red.send(err);

    if (!req.body.name || !req.body.deadline) {
      res.json({message: 'Validation error! A name is required! A deadline is required!', data: []});
      return;
    }

    task.name = req.body.name;
    task.deadline = req.body.deadline;

    task.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'Task updated', data:task });
    });
  });
});

//DELETE
taskIDRoute.delete(function(req, res) {
  Task.remove({_id:req.params.task_id}, function(err, task) {
    if (err)
      res.send(err);

  res.json({ message: 'Task deleted', data:[] });
  });
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
