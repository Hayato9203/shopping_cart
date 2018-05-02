var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require("../models/order");
var Cart = require("../models/cart");
/**   CSRF
 * Cross-site request forgery, also known as one-click attack or session riding and abbreviated as CSRF (sometimes pronounced sea-surf) or XSRF, is a type of malicious exploit of a website where unauthorized commands are transmitted from a user that the web application trusts.
 */
var csrfProtection = csrf();
router.use(csrfProtection); //all the route in this file is protected by csrf

router.get('/profile', isLoggedIn, function (req, res, next) {
    Order.find({ user: req.user }, function (err, orders) {
        if (err) return res.write("Error occured!");
        /**
         * need to generate the array method which set up in ther cart model,give the array of items use to output profile page
         */
        var cart;
        orders.forEach(function (order) {
            cart = new Cart( order.cart );
            order.items = cart.generateArray();
        });
        res.render( "user/profile", { orders: orders });
    });
});

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

/**
 * Protecting routes
 * all routing requests below here need to pass this verification in order to perform the next * step
 * If not logged in, the user is allowed to use the following route
 */
router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    //possible reflash messages stored in request through this flash package
    var messages = req.flash('error');
    res.render('user/signup', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    }); //csrfToken change with each request from the request page
});

/** 
 * ------------From the checkout page,if the user does not have an account------------
 * to apply the strategy,use the passport.js's local.signup to authenticate,but in this 
 * step is doesn't work because nowhere importing /config/passport.js,loading 
 * /config/passport.js in app.js will solve this problem
 */
router.post(
    "/signup",
    passport.authenticate("local.signup", {
        //successRedirect: "/user/profile",
        failureRedirect: "/user/signup",
        failureFlash: true
    }),
    function (req, res, next) {
        if (req.session.oldUrl) {
            var oldUrl = req.session.oldUrl;
            /**
             * it's necessary that set the req.session.oldUrl to null
             * otherwise it will redirect the user to the checkout page forever
             */
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        } else res.redirect("/user/profile");
    }
);

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});

/**
 * -----------From the checkout page,if the user has an account------------
 * delete the successRedirect,in the case of checkout but request to signin,after the 
 * success do not need to be redirect to the profile page
 * 
 * passport.authenticate will be a normal middleware,the function will be excuted when
 * passport authentication is passed successfully
 * 
 * if fail to authenticated,will not reach the third function then instead will go the 
 * failureRedirect
 */
router.post('/signin',
    passport.authenticate('local.signin', {
        //successRedirect: '/user/profile',
        failureRedirect: '/user/signin',
        failureFlash: true
    }),
    function (req, res, next) {
        if (req.session.oldUrl) {
            var oldUrl = req.session.oldUrl;
            /**
             * it's necessary that set the req.session.oldUrl to null
             * otherwise it will redirect the user to the checkout page forever
             */
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        } else res.redirect('/user/profile');
    });

module.exports = router;


/**
 * my own middleware
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
/**
 * If the user is not logged in, some pages are not allowed to be accessed
 */
function isLoggedIn(req, res, next) {
    /**
     * isAuthenticated as a method added by passport and passport manages the authentication state in the session automactically so when you successfully login it will set it to true
     */
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
/**
 * if the user is already logged in, the signin and signup or others page is not allowed to be accessed,and redirect there page to the router '/'
 */
function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated())
        return next();
    res.redirect('/');
}