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
  console.log(req.body);
  res.render("home.ejs");
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

app.get("/account", function (req, res) {
  res.render('account.ejs');
});

app.post("/processCall", function (req, res) {
  //require the Twilio module and create a REST client
  var client = require('twilio')(twilioAccountSID, twilioAuthToken);
  var callSid = req.body.callId;
  var currentUserId = req.body.currentUserId;
  var expertId = req.body.expertId;
  var expertFee = req.body.expertFee;

  client.calls.list({
    "ParentCallSid": callSid,
    "To!=": null,
  }, function(err, data) {
    data.calls.forEach(function(call) {
      var newCall = ref.child("calls").push(call);
      ref.child('calls').child(newCall.key()).update({
        callerId: currentUserId,
        expertId: expertId,
        expertFee: expertFee,
        paymentStatus: 'unpaid',
      });
      if ((call.status == 'completed') && (call.duration > 0)){
        var totalMin = Math.ceil(call.duration / 60);
        var totalFee = expertFee * totalMin * 100;
        usersRef.child(currentUserId).once("value", function(snapshot) {
          var customerId = snapshot.val().customerId;
          stripe.charges.create({
            amount: totalFee, // amount in cents, again
            currency: "usd",
            customer: customerId,
          })
        });
      };
    });
  });
  res.render("account.ejs");
});

app.get('user/:user_id', function (req, res) {
  var user_id = req.params.user_id;
  usersRef.child(user_id).once("value", function(snapshot){
    var user = snapshot.val();
    res.render("profile.ejs", { user: user });
  });
});

app.post("/newPaymentMethod", function (req, res) {
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
    res.location('/account');
  });
});


app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
