var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
    // var products = Product.find();
    // res.render('shop/index', { title: 'Shopping Cart', products: products });//this is wrong bcoz of asychronous behaviour
    var successMsg = req.flash('success')[0];
    Product.find(function(err, docs){
        var chunkSize = 3;
        var productChunks = [];
        for(var i = 0; i < docs.length; i += chunkSize){
            productChunks.push(docs.slice(i, i+chunkSize));
        }
        res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    })
});

router.get('/add-to-cart/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productId, function(err, product){
        if(err){
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/reduce/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next){
    // console.log('shopping-cart route called');
    if(!req.session.cart){
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next){
    if(!req.session.cart){
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next){
    if(!req.session.cart){
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    var stripe = require("stripe")(
      "sk_test_VpfduI4fmtqrfuO1qh9ddgWL"
    );

        stripe.charges.create({
          amount: cart.totalPrice * 100,//in cents
          currency: "usd",
          source: "tok_mastercard", // obtained with Stripe.js
          description: "Test Charge"
        }, function(err, charge) {
            // asynchronously called
            if(err){
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }
            var order = new Order({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id
            });

            order.save(function(err, result){
                if(err){
                    req.flash('error', err.message);
                    return res.redirect('/checkout');
                }
                req.flash('success', 'Successfully Bought product!');
                req.session.cart = null;
                res.redirect('/');
            });

        });
});

module.exports = router;

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
