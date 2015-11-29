'use strict';

var node_env = process.env.NODE_ENV || "development";
var port = process.env.PORT || 8080;

var fs = require('fs'),
    config = JSON.parse(fs.readFileSync('config.json')),
    express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    stripe = require("stripe")(config[node_env].stripe.secret),
    Firebase = require('firebase'),
    twilio = require('twilio'),
    ref = new Firebase('https://dibbl.firebaseio.com/'),
    usersRef = ref.child("users"),
    callsRef = ref.child("calls");

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.render("home.ejs");
});

app.get("/partials/:name", function (req, res) {
  var name = req.params.name;
  var url = "partials/_" + name + ".ejs"
  res.render(url);
});

app.get("/search", function (req, res) {
  var capability = new twilio.Capability(
      config[node_env].twilio.accountSid,
      config[node_env].twilio.authToken
  );

  capability.allowClientIncoming('browser-bot');
  capability.allowClientOutgoing(config[node_env].twimlAppSid);

  res.render('search.ejs', {
      token:capability.generate()
  });
});

app.get("/account", function (req, res) {
  res.render('account.ejs');
});

app.post("/processCall", function (req, res) {
  //require the Twilio module and create a REST client
  var client = require('twilio')(config[node_env].twilio.accountSid, config[node_env].twilio.authToken);
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
          });
          ref.child('calls').child(newCall.key()).update({
            paymentStatus: 'paid',
          });
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
