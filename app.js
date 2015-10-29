'use strict';

var express = require("express");
var bodyParser = require('body-parser');
var stripe = require("stripe")("sk_test_l30FERrHXVw4pz7LDQkVEHQI");
var Firebase = require('firebase');
var ref = new Firebase('https://dibbl.firebaseio.com/'),
    usersRef = ref.child("users");
var app = express();


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.post("/newCustomer", function (req, res) {
  var stripeToken = req.body.stripeToken;
  var userId = req.body.userId;

  stripe.customers.create({
    source: stripeToken,
    description: 'payinguser@example.com',
    metadata: {
      userId: userId,
    }
  }).then(function(customer) {
    usersRef.child(customer.metadata.userId).child('customerId').set(customer.id);
  }).then(function(){
    res.render("index.ejs");
  });
});

app.post("/charge", function (req, res) {
  res.render("login.ejs");
});
  // # YOUR CODE: When it's time to charge the customer again, retrieve the customer ID!
  //
  // stripe.charges.create({
  //   amount: 1500, // amount in cents, again
  //   currency: "usd",
  //   customer: customerId # Previously stored, then retrieved
  // });
  // });

app.listen(3000);
