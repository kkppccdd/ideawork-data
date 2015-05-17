/**
 * Module dependencies.
 */
var assert = require("assert");

var express = require('express');
var ejs = require("ejs");
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var mongo = require("mongodb");
var session = require('cookie-session')

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

// load mongodb url
var mongodbUrl = process.env.MONGOLAB_URI;

var db = mongoskin.db(mongodbUrl, {
	native_parser : true
});

//authentication configuration
passport.use(new BasicStrategy(
		  function(username, password, done) {
			  // find user from db by username
			  db.collection('user').findOne({username:username},function(err, user){
				  if (err) { return done(err); }
			      if (!user) {
			        return done(null, false, { message: 'Incorrect username.' });
			      }
			      if (user.password!=password) {
			        return done(null, false, { message: 'Incorrect password.' });
			      }
			      return done(null, user);
			  });
		  }
));

passport.serializeUser(function(user, done) {
	  done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		db.collection('user').findById(id,function (err, model){
			done(err,model);
		});
	});

var app = express();

// all environments
app.use(session({
	keys : [ 'key1', 'key2' ]
}));

app.use(logger('dev'));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({
	limit : '5mb'
}));
app.use(bodyParser.urlencoded({
	extended : true,
	limit : '5mb'
}));

app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'development') {
	// only use in development
	var errorhandler = require('errorhandler');
	app.use(errorhandler());
}

var dataServiceRouter = require("./data/service.js");
app.use('/data', function(req,res,next){
	// only protected WRITE ACCESS
	if(req.method === "POST" || req.method === "PUT"){
		passport.authenticate('basic', { session: true })(req,res,next);
	}else{
		next();
	}
} ,dataServiceRouter);

// register

// check whoami

app.get('/authentication/me',function(req,res,next){
	
});

app.post('/authentication/register',function(req,res,next){
	
});




http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
