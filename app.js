'use strict';

var express = require("express");
var bodyParser = require('body-parser');
var stripe = require("stripe")("sk_test_l30FERrHXVw4pz7LDQkVEHQI");
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.render("index.ejs");
});


app.post("/charge", function (req, res) {
  var stripeToken = req.body.stripeToken;

  var charge = stripe.charges.create({
    amount: 1000, // amount in cents, again
    currency: "usd",
    source: stripeToken,
    description: "Example charge"
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      // The card has been declined
    }
  });
});

app.listen(3000);
