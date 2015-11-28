var ref = new Firebase("https://dibbl.firebaseio.com");
var usersRef = ref.child("users");
var callsRef = ref.child("calls");
var currentUser;
var currentUserId;
var currentCall;
var serverConnected = false;

// Call Object

var Call = function(callId, callerId, expertId, expertFee) {
  this.callId = callId ? callId : '';
  this.callerId = callerId;
  this.expertId = expertId;
  this.expertFee = expertFee;
};

Call.prototype.expert = function() {
  var expert;
  usersRef.child(this.expertId).once("value", function(snapshot){
    expert = snapshot.val();
    return expert;
  });
  return expert;
};

Call.prototype.create = function() {
  usersRef.child(this.expertId).once("value", function(snapshot){
    var expert = snapshot.val();
    console.log(expert);
    $.post( "/call", expert);
  });
};

Call.prototype.displayIncoming = function() {
  console.log('displayIncoming');
  usersRef.child(this.callerId).once("value", function(snapshot){
    var caller = snapshot.val();

    var $callerInfo = $('<p>').html('from ' + caller.firstname + ' ' + caller.lastname),
        $accept = $('<button>').text('accept').attr('id', 'acceptCall'),
        $hold = $('<button>').text('hold').attr('id', 'holdCall'),
        $holdTime = $('<input>').attr('type', 'number').attr('id', 'holdTime'),
        $decline = $('<button>').text('decline').attr('id', 'declineCall');

    var $options = $('<div>').append($accept).append($hold).append($holdTime).append($decline);

    var $request = $('<div>').addClass('incoming-call').attr('id', this.callId).append($callerInfo).append($options);

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
    if (error) {
      console.log(error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      location.href = "/search";
    }
  });
};

User.prototype.addToFirebase = function(userId){
  ref.child("users").child(userId).update({
  });
};

User.prototype.displayAsSearchResult = function(userId, user, time){
  var photo = user.photo,
      firstname = user.firstname,
      lastname = user.lastname,
      bio = user.bio,
      fee = user.fee,
      skills = user.skills;

  var totalfee = fee * time;
  totalfee = totalfee.toFixed(2);
  totalfee = '$' + totalfee;


  var $photo = $('<div>').addClass('userPhoto');
  if (photo) {
    $photo = $photo.css('background-image', 'url("' + photo + '")');
  };

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
  var $callButton = $('<button class="connectButton small-blue">').text('CONNECT');

  var $section1 = $('<div>').addClass('col-md-4').append($photo);
  var $section2 = $('<div>').addClass('col-md-8').append($faveIcon).append($userName).append($rating).append($userFee).append($userSkills).append($userDetails).append($callButton).attr('data-fee', fee);
  var $userInfo = $('<div>').addClass('userInfo row').append($section1).append($section2);

  $('#searchResults').append($userInfo);
};

User.prototype.loadIncomingCalls = function(userId){
  callsRef.orderByChild('expertId').equalTo(userId).on("child_added", function(snapshot){
    var call = snapshot.val();
    var incomingCall = new Call(snapshot.key(), call.callerId, call.expertId, call.expertFee);
    incomingCall.displayIncoming();
  });
};
