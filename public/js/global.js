var ref = new Firebase("https://dibbl.firebaseio.com");
var usersRef = ref.child("users");
var callsRef = ref.child("calls");
var currentUser;
var currentUserId;
var currentCall;
var serverConnected = false;

// Call Object

var Call = function(callId, callerId, expertId, expertFee){
  this.callId = callId ? callId : '';
  this.callerId = callerId;
  this.expertId = expertId;
  this.expertFee = expertFee;
};

Call.prototype.addToFirebase = function(){
  var newCall = callsRef.push({
    callerId: this.callerId,
    expertId: this.expertId,
    expertFee: this.expertFee,
    requestedAt: Firebase.ServerValue.TIMESTAMP,
  });
  this.id = newCall.key();
  console.log('added to firebase: new call id#' + this.id);
  location.href = '/call/' + this.id;
};

Call.prototype.displayIncoming = function() {
  console.log('displayIncoming');
  usersRef.child(this.callerId).once("value", function(snapshot){
    var caller = snapshot.val();
    console.log('caller is ', caller);
    var $accept = $('<button>').text('accept').attr('id', 'acceptCall');
    var $hold = $('<button>').text('hold').attr('id', 'memo');
    var $decline = $('<button>').text('decline').attr('id', 'declineCall');
    var $options = $('<div>').append($accept).append($hold).append($decline);
    var $request = $('<div>').html('from ' + caller.firstname + ' ' + caller.lastname).addClass('connection-request').attr('id', this.id).append($options);
    $('.live-update.incoming-call').append($request);
    $('.live-update').slideDown();
    $('.shortcut.incoming-calls').addClass('urgent');
    $('.shortcut.incoming-calls .label').text('Incoming Call');
  }.bind(this));
};


// User Object

var User = function(){};

User.prototype.signupWithEmail = function(firstname, lastname, email, password){
  ref.createUser({
    email    : email,
    password : password
  }, function(error, authData) {
    if (error) {
      $('.loginError').show();
      $('.loginError').text(error);
      console.log("erroring out");
    } else {
      console.log("Successfully created user account with uid:", authData.uid);
      ref.child("users").child(authData.uid).update({
        firstname: firstname,
        lastname: lastname,
        email: email,
      });
      this.loginWithEmail(email, password);
    }
  }.bind(this));
};

User.prototype.loginWithEmail = function(email, password){
  console.log('trying to login');
  ref.authWithPassword({
    "email"    : email,
    "password" : password
  }, function(error, authData) {
    console.log("Authenticated successfully with payload:", authData);
    location.href = "/search";
  });
};

User.prototype.addToFirebase = function(userId){
  ref.child("users").child(userId).update({
  });
};

User.prototype.displayAsSearchResult = function(userId, user, time){
  var firstname = user.firstname,
      lastname = user.lastname,
      bio = user.bio,
      fee = user.fee,
      skills = user.skills;

  var totalfee = fee * time;
  totalfee = totalfee.toFixed(2);
  totalfee = '$' + totalfee;

  var $faveIcon = $('<i>').addClass('fa fa-heart faveIcon');
  var $userName = $('<h5>').html(firstname + ' ' + lastname).attr('id', userId).addClass('userName');
  var $rating = $('<div>').addClass('rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i>');
  var $userFee = $('<h5>').text(totalfee).addClass('userFee');
  var $userSkills = $('<div>').addClass('userSkills');
  for (var i = 0; i < skills.length; i++) {
    var $userSkill = $('<span>').html(skills[i]);
    $userSkills = $userSkills.append($userSkill);
  };
  var $userDetails = $('<p>').text(bio);
  var $callButton = $('<button class="connectButton">').text('CONNECT');
  var $userInfo = $('<div>').addClass('userInfo').append($faveIcon).append($userName).append($rating).append($userFee).append($userSkills).append($userDetails).append($callButton).attr('data-fee', fee);

  $('#searchResults').append($userInfo);
};

User.prototype.loadIncomingCalls = function(userId){
  callsRef.orderByChild('expertId').equalTo(userId).on("child_added", function(snapshot){
    var call = snapshot.val();
    var incomingCall = new Call(snapshot.key(), call.callerId, call.expertId, call.expertFee);
    incomingCall.displayIncoming();
  });
};

// Authorization & Loading Current User Info
var authDataCallback = function(authData){
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
    usersRef.child(authData.uid).on("value", function(snapshot){
      currentUser = snapshot.val();
      currentUserId = snapshot.key();
      var user = new User();
      user.loadIncomingCalls(currentUserId);
    });
  } else {
    console.log("User is logged out");
    currentUser = {};
    currentUserId = '';
    if ( window.location.pathname.length > 1 ) {
      location.href = "/";
    } else {
      console.log('already home');
    };
  }
};

ref.onAuth(authDataCallback);
