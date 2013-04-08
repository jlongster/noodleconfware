var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var settings = require('./settings')(app, configurations, express);
var nunjucks = require('nunjucks');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
var speakers = require('./speakers');
var audience = require('./audience');

env.express(app);

nconf.argv().env().file({ file: 'local.json' });

/* Websocket setup */
var io = require('socket.io').listen(server);

io.configure(function() {
  io.set('log level', 1);
});

io.sockets.on('connection', function(socket) {
  socket.on('join channel', function(channel) {
    socket.join(channel);
  });
});

/* Filters for routes */
var isLoggedIn = function (req, res, next) {
  var email = req.session.email.toLowerCase();
  if (req.session.email && (audience.indexOf(email) === 0 || speakers.indexOf(email) === 0))  {
    next();
  } else {
    res.redirect('/not_authorized');
  }
};

var setSpeaker = function (req, res, next) {
  req.session.speaker = false;
  if (req.session.email && speakers.indexOf(req.session.email.toLowerCase()) === 0) {
    req.session.speaker = true;
  }
  next();
};

var isSpeaker = function (req, res, next) {
  if (req.session.speaker) {
    next();
  } else {
    res.redirect('/');
  }
};

/* Persona setup */
require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

/* Routes */
require("./routes")(app, setSpeaker, isSpeaker, isLoggedIn);

app.get('/404', function(req, res, next){
  next();
});

app.get('/403', function(req, res, next){
  err.status = 403;
  next(new Error('not allowed!'));
});

app.get('/500', function(req, res, next){
  next(new Error('something went wrong!'));
});

app.listen(process.env.PORT || nconf.get('port'));
