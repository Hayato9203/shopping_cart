var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

//tell the passport how to store the user in the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
    //which basically means whenever you want to store the user in the session serialize by ID,so use the ID of user which of cause can be retrived
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user); //the first argument when returning done is of cause always the error case therefore setting this to null here when serializing the user
    });
});

/**
 * implement a strategy for user signup,names local.signup
 * first argument is configuration in form of a javascript object
 */
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email', //it can be username or other in your case
    passwordField: 'password',
    passReqToCallback: true //means you can get the request and use it in callback function
}, function(req, email, password, done) {
    var email = email.toLowerCase();
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4 });
    //handling recognize errors of above req.checkBody
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages)); //sending bundled messages to review with flash middleware here and interview to 'local.signup' user
    }
    User.findOne({ 'email': email }, function(err, user) {
        if (err)
            return done(err);
        if (user)
            return done(null, false, { message: 'Email is already in use' });
        /**not telling passport that is was successful,just telling no error appeared
         * return done with null,nothing went on here
         * not with any retrieved object
         * message will store in the session which can output in the views
         */
        /*var newUser = new User({
            'email': email,
            'password': newUser.encryptPassword(password)//method encryptPassword can't use in object cause inconsistent
        });*/
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
            if (err)
                return done(err);
            return done(null, newUser);
        });
    });
}));

/**
 * implement a strategy for user signin
 */
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email }, function(err, user) {
        if (err)
            return done(err);
        if (!user)
            return done(null, false, { message: 'No user found.' });
        if (!user.validPassword(password))
            return done(null, false, { message: 'Wrong password.' })
        return done(null, user); //no error and return the user found in the database
    });
})); //don't need to validate but give some error message like 'forget enter password' or 'no user founded'