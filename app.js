/**
 * Add an anonymous user to add a shopping cart features
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
/**    express-session
 * Is purposely not designed for a production environment is meant for debugging and developing
 * should tell the session that it shouldn't use the default memory store anymore of cause
 */
var passport = require('passport');
/** passport doesn't ship with all functionality out of the box,because doesn't know which
 *  field has email and password or username and password
 */
/** local strategy:local on this server that's where the name comes from stored the user so 
 * creat with email and password whatever you like but store in this server.other strategies
 * could be facebook to use facebook login and so on
 */

/**
 * how does it get cleaned up the expired session right otherwise will crowed our
 * database with old session
 * see https://www.npmjs.com/package/connect-mongo
 */

/**
 * attach message to the request to render them in the views
 */
var flash = require('connect-flash');
var validator = require('express-validator');
/**
 * Mongo Store
 * need the connect-mongo package and need to pass the function 'session' in its
 */
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var user = require('./routes/user');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('127.0.0.1:27017/my-shopping');
require('./config/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images/', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/** validator on its own parse the body and retrieve the parameters you want to validate from 
 * the submitted request body therefore this has to done after the body is parsed
 */
app.use(validator()); //it will use to the passport authenticate__config/passport.js
app.use(cookieParser());
/**
 * use for index.js's csrf
 */
/**
 * tell its not open a new connection on its own instead
 * the MongoStore option is use the existing mongoose connection which can access on mongoose 
 * object
 * the cookie option configure how long the session should live before there expire(180min 
 * here)
 * 
 * make the session avaliable in views through handlebars
 */
app.use(session({
    secret: 'mysupersecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //store users
app.use(express.static(path.join(__dirname, 'public')));

/**
 * A middleware executed on all request
 * Gloable property or variable which will available in views using the locals object on the 
 * response
 * pass the session object and make sure may access session in all template without pass it 
 * explicitly in routes or routes function
 */
app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.user = req.user || null;
    next();
});

app.use('/', index);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;