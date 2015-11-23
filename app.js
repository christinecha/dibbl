'use strict';

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    stripe = require("stripe")("sk_test_l30FERrHXVw4pz7LDQkVEHQI"),
    Firebase = require('firebase'),
    PeerConnection = require('rtcpeerconnection'),
    twilioAccountSID = 'ACa9661f788bc6132577b3341523890490',
    twilioAuthToken = "31fba9f52896b8b46064faf7884b5d4f",
    twilio = require('twilio'),
    ref = new Firebase('https://dibbl.firebaseio.com/'),
    usersRef = ref.child("users"),
    callsRef = ref.child("calls");

var port = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  var callData = [];
  var client = twilio(twilioAccountSID, twilioAuthToken);
  client.calls.list(function(err, data) {
    data.calls.forEach(function(call) {
        callData.push(call);
    });
    res.render("home.ejs", {calldata: callData});
  });
});

app.get("/header", function (req, res) {
  res.render("_header.ejs");
});

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.get("/search", function (req, res) {
  var capability = new twilio.Capability(
      'ACa9661f788bc6132577b3341523890490',
      "31fba9f52896b8b46064faf7884b5d4f"
  );

  capability.allowClientIncoming('browser-bot');
  capability.allowClientOutgoing('AP1f84916b6c4873c17e559d518be948da');

  res.render('search.ejs', {
      token:capability.generate()
  });
});

app.post("/addCallToFirebase", function (req, res) {
  //require the Twilio module and create a REST client
  var client = require('twilio')(twilioAccountSID, twilioAuthToken);
  var callSid = req.body.callId;

  client.calls.list({
    ParentCallSid: callSid,
    // To!: null,
  }, function(err, data) {
    data.calls.forEach(function(call) {
      ref.child("calls").push(call);
    });
  });

});

app.get('user/:user_id', function (req, res) {
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


app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
