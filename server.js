'use strict';

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    stripe = require("stripe")("sk_test_l30FERrHXVw4pz7LDQkVEHQI"),
    Firebase = require('firebase'),
    PeerConnection = require('rtcpeerconnection'),
    ref = new Firebase('https://dibbl.firebaseio.com/'),
    usersRef = ref.child("users"),
    callsRef = ref.child("calls");

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.render("home.ejs");
});

app.get("/header", function (req, res) {
  res.render("_header.ejs");
});

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.get("/search", function (req, res) {
  res.render("search.ejs");
})

app.get("/search:query:time", function (req, res) {
  var query = req.params.query,
      time = req.params.time;
  res.render("search.ejs", {
    query: query,
    time: time,
  });
});

app.get("/call/:call_id", function (req, res) {
  var call_id = req.params.call_id;
  console.log(httpUrl);
  res.render("call.ejs", { call_id: call_id });
});

app.get('user/:user_id', function (req, res, next) {
  var user_id = req.params.user_id;
  usersRef.child(user_id).once("value", function(snapshot){
    var user = snapshot.val();
    res.render("profile.ejs", { user: user });
  });
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
  console.log(req.body);
  stripe.charges.create({
    amount: req.body.totalfeeCents, // amount in cents, again
    currency: "usd",
    customer: req.body.customer
  }).then(function(){
    res.render("index.ejs");
  });
});


/*global console*/
var yetify = require('yetify'),
    config = require('getconfig'),
    fs = require('fs'),
    sockets = require('./sockets'),
    port = parseInt(process.env.PORT || config.server.port, 10),
    server_handler = function (req, res) {
        res.writeHead(404);
        res.end();
    },
    server = null;

// Create an http(s) server instance to that socket.io can listen to
if (config.server.secure) {
    server = require('https').Server({
        key: fs.readFileSync(config.server.key),
        cert: fs.readFileSync(config.server.cert),
        passphrase: config.server.password
    }, server_handler);
} else {
    server = require('http').Server(server_handler);
}
server = app.listen(port);

sockets(server, config);

if (config.uid) process.setuid(config.uid);

var httpUrl;
if (config.server.secure) {
    httpUrl = "https://localhost:" + port;
} else {
    httpUrl = "http://localhost:" + port;
}
console.log(yetify.logo() + ' -- signal master is running at: ' + httpUrl);
