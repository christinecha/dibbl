'use strict';

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    stripe = require("stripe")("sk_test_l30FERrHXVw4pz7LDQkVEHQI"),
    Firebase = require('firebase'),
    PeerConnection = require('rtcpeerconnection'),
    twilio = require('twilio'),
    ref = new Firebase('https://dibbl.firebaseio.com/'),
    usersRef = ref.child("users"),
    callsRef = ref.child("calls");

var port = process.env.PORT || 8080;

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
});

app.get("/search:query:time", function (req, res) {
  var query = req.params.query,
      time = req.params.time;
  res.render("search.ejs", {
    query: query,
    time: time,
  });
});

app.get("/calls", function (req, res) {
  // Create an object which will generate a capability token
  // Replace these two arguments with your own account SID
  // and auth token:
  var capability = new twilio.Capability(
      'ACa9661f788bc6132577b3341523890490',
      "31fba9f52896b8b46064faf7884b5d4f"
  );

  // Give the capability generator permission to accept incoming
  // calls to the ID "kevin"
  capability.allowClientIncoming('kevin');

  // Give the capability generator permission to make outbound calls,
  // Using the following TwiML app to request call handling instructions:
  capability.allowClientOutgoing('AP1f84916b6c4873c17e559d518be948da');

  // Render an HTML page which contains our capability token
  res.render('calls.ejs', {
      token:capability.generate()
  });
});
//
// app.post("/call", function (req, res) {
//   var expertPhone = req.body.phone;
//
//   var accountSid = 'ACa9661f788bc6132577b3341523890490';
//   var authToken = "31fba9f52896b8b46064faf7884b5d4f";
//   var client = require('twilio')(accountSid, authToken);
//
//   client.calls.create({
//       url: "http://demo.twilio.com/docs/voice.xml",
//       to: expertPhone,
//       from: "+12016135398"
//   }, function(error, message) {
//       if (error) {
//           console.log(error.message);
//       }
//   });
// });


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
