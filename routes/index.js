var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var Cart = require("../models/cart");
var Order = require("../models/order");

/* GET home page. */
router.get("/", function(req, res, next) {
    var successMsg = req.flash("success")[0]; // will stored in /checkout post
    /*var products = Product.find();
        res.render('shop/index', {
            title: 'My Shopping Cart!',
            products: products
        });*/
    /**this is the same problem we had in the SEEDER the finding of PRODUCT is asynchronous therefore we are calling the render method here when we actually haven't gotten all the results back so as you can see it's looping through something because PRODUCT is some kind of Mongoose -->OBJECT<-- at this point but it's not the actual result it's not the actual PRODUCT -->ARRAY<-- we get this array */
    Product.find(function(err, docs) {
        var productChunks = [];
        var chunkSize = 3; //The number of lines displayed
        for (var i = 0; i < docs.length; i += chunkSize) //[0,3],will render 2 times
            productChunks.push(docs.slice(i, i + chunkSize)); //[0,1,2],[3,4,5]
        res.render("shop/index", {
            title: "Shopping Cart!",
            products: productChunks,
            successMsg: successMsg,
            noMessages: !successMsg
        }); //render 2 times
    });
});

/**
 * push the product want to add to cart,kind of into session,will store it in a object
 * but not a list
 */
router.get("/add-to-cart/:id", function(req, res, next) {
    var productId = req.params.id;
    /**new cart will be created each time when add a new item,also pass the old cart through
     * session if it exists
     */
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err) return res.redirect("/");
        cart.add(product, product.id);
        /**
         * the express session will automatically save with each response sent back
         */
        req.session.cart = cart;
        console.log(req.session.cart);
        return res.redirect("/");
    });
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get("/remove/:id", function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});

router.get("/shopping-cart", function(req, res, next) {
    if (!req.session.cart)
        return res.render("shop/shopping-cart", {
            products: null
        });
    var cart = new Cart(req.session.cart);
    res.render("shop/shopping-cart", {
        products: cart.generateArray(),
        totalPrice: cart.totalPrice
    });
});

/**
 * if the user is anonymous,then redirect to signin page instead of the checkout page
 * also remember that the user want to redirect to checkout page after successfully
 * logging in to provide a better experience
 * 
 * need to protect the 'get' checkout routes and 'post' checkout routes
 */
router.get("/checkout", isLoggedIn, function(req, res, next) {
    if (!req.session.cart) return res.redirect("/shopping-cart");

    var errMsg = req.flash("error")[0];
    var cart = new Cart(req.session.cart);
    res.render("shop/checkout", {
        total: cart.totalPrice,
        errMsg: errMsg,
        noError: !errMsg
    });
});

/**
 * make charge from the API libary https://stripe.com/docs/api/node#create_charge
 */
router.post("/checkout", isLoggedIn, function(req, res, next) {
    if (!req.session.cart) return res.redirect("/shopping-cart");

    var cart = new Cart(req.session.cart);

    var stripe = require("stripe")("sk_test_2Ng2OLMPg6p6rPpRZ0LVUd8D");

    stripe.charges.create({
            amount: cart.totalPrice * 100,
            currency: "usd",
            /**
             * the source obtained with Stripe.js 
             * <input type="hidden" name="stripeToken" /> which validated the credit card in 
             * checkout.js
             */
            source: req.body.stripeToken,
            description: "Charge for cc.owens@outlook.jp"
        },
        function(err, charge) {
            // asynchronously called
            if (err) {
                req.flash("error", err.message);
                return res.redirect("/checkout");
            }
            /**
             * in theory because later on will force the user to be authenticated in order
             * to make a check out anonymous,will implement such a functionality to fix it
             * 
             * fetch the user from request,passport will does this for us since passport
             * in this application whenever sign in with passport,will place user object
             * on the request,therefore throughtout whole application ,can always access
             * the user object or check if the user is logged in
             * 
             * can retrieve the paymentId from the charge callback,reading the stripe
             * documentation,will knowed how the response object looks like
             */
            var order = new Order({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id
            });
            order.save(function(err, result) {
                req.flash("success", "Successfully bought product!");
                req.session.cart = null;
                res.redirect("/");
            });
        }
    );
});

module.exports = router;
/**
 * you can refract these function to a separat file
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    /**
     * can access the URL on request property
     */
    req.session.oldUrl = req.url;
    res.redirect("/user/signin");
}

/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect("/");
}