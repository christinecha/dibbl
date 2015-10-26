var ref = new Firebase("https://dibbl.firebaseio.com");
var usersRef = ref.child("users");
var callsRef = ref.child("calls");
var requestsRef = ref.child("requests");
var currentUser;
var currentCall;

// USER AUTHENTICATION ------------------------------------------

$('.alreadyUser').on('click', function(){
  $('#userSignUp').hide();
  $('#firstname').hide();
  $('#lastname').hide()
  $('#userLogin').show();
  $(this).hide();
  $('.notUserYet').show();
});

$('.notUserYet').on('click', function(){
  $('#userSignUp').show();
  $('#firstname').show();
  $('#lastname').show()
  $('#userLogin').hide();
  $(this).hide();
  $('.alreadyUser').show();
});

//Sign Up With Email
$('#userSignUp').on('click', function(){
  var usersRef = ref.child('users');
  var firstname = $('#firstname').val();
  var lastname = $('#lastname').val();
  var email = $('#email').val();
  var password = $('#password').val();

  ref.createUser({
    email    : email,
    password : password
  }, function(error, userData) {
    if (error) {
      $('.loginError').show();
      $('.loginError').text(error);
    } else {
      console.log("Successfully created user account with uid:", userData.uid);
      ref.child("users").child(userData.uid).update({
        firstname: firstname,
        lastname: lastname,
        email: email,
      });
      ref.authWithPassword({
        "email"    : email,
        "password" : password
      }, function(error, authData) {
        console.log("Authenticated successfully with payload:", authData);
        location.href = "index.html";
      });
    }
  });

});

// Log In
$('#userLogin').on('click', function(){
  var email = $('#email').val();
  var password = $('#password').val();

  ref.authWithPassword({
    "email"    : email,
    "password" : password,
  }, function(error, authData) {
    if (error) {
      $('.loginError').show();
      $('.loginError').text(error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      location.href = "index.html";
    }
  });
});

// Log out
$('#header').on('click', '.logout', function(){
  ref.unauth();
});

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
    currentUser = authData;
    currentUserId = authData.uid;
    // DISPLAY CURRENT USER'S DETAILS -------------------------------------
    var currentUserRef = usersRef.child(currentUserId);
    currentUserRef.on("value", function(snapshot) {
      currentUserObj = snapshot.val();
      $('#profile #firstname').text(currentUserObj.firstname);
      $('#profile #lastname').text(currentUserObj.lastname);
      currentUserRef.child("skills").on("child_added", function(childSnapshot){
        var $skill = $('<h4>').text(childSnapshot.key());
        $('#profile #skills').append($skill);
      });
    });
  } else {
    console.log("User is logged out");
    currentUser = {};
    currentUserId = '';
    currentUserObj = {};
    currentGroup = '';
    currentGroupName = '';
    if ( window.location.href.indexOf("login.html") > -1 ) {
      //do nothing
    } else {
      location.href = "login.html";
    };
  }
}
// Register the callback to be fired every time auth state changes
ref.onAuth(authDataCallback);

//Store User Data
var isNewUser = true;
ref.onAuth(function(authData) {
  if (authData && isNewUser) {
    // save the user's profile into the database so we can list users,
    // use them in Security and Firebase Rules, and show profiles
    ref.child("users").child(authData.uid).update({
      provider: authData.provider,
      name: getName(authData)
    });
  }
});


// find a suitable name based on the meta info given by each provider
function getName(authData) {
  switch(authData.provider) {
     case 'password':
       return authData.password.email.replace(/@.*/, '');
  }
};

$('#additionalInfoSignUp').on('click', function(){
  var skype = $('#skype').val();
  var venmo = $('#venmo').val();
  var phone = $('#phone').val().replace(/.\-/g, '');

  ref.child("users").child(currentUserId).update({
    skype: skype,
    venmo: venmo,
    phone: phone
  });
  location.href = "account.html";
});

//// NAVIGATION ------------------------------------------------------
$('.page-nav').on('click', function(){
  var page = $(this).attr('data-page');
  var pageId = '#' + page;

  $('.page').hide();
  $(pageId).show();
});


//// REQUESTS ------------------------------------------------------
requestsRef.orderByChild('recipient').equalTo(currentUser.uid).on("child_added", function(snapshot){
  var request = snapshot.val();
  var requestId = snapshot.key();
  var $request = $('<button>').text('connection request').attr('id', requestId).attr('data-callId', request.callId);
  $('#requests').append($request);
  alert('you\'ve got a connection request!');
});

$('#requests').on('click', 'button', function(){
  var requestId = $(this).attr('id');
  var callId = $(this).attr('data-callId');
  requestsRef.child(requestId).remove();
  joinCall(callId);
});


//// PROFILE ------------------------------------------------------
$('#skillsForm').on('submit', function(){
  var skill = $('#skill').val();
  usersRef.child(currentUser.uid).child("skills").child(skill).set(true);
});


//// USER SEARCH ------------------------------------------------------
$('#userSearchForm').on('submit', function(){
  var query = $("#query").val();
  console.log('searching for an expert in ' + query);

  usersRef.orderByChild("skills/" + query).equalTo(true).on("child_added", function(snapshot){
    var matchedUser = snapshot.val();
    displayMatchedUsers(snapshot.key(), matchedUser.firstname, matchedUser.lastname, matchedUser.info);
  })

  return false;
});

var displayMatchedUsers = function(id, firstname, lastname, info){
  $('#searchResults').empty();
  console.log('working?', firstname);

  var $userName = $('<h2>').html(firstname + ' ' + lastname).attr('id', id).addClass('userName');
  var $userDetails = $('<p>').text(info);
  var $callButton = $('<button class="connectButton">').text('CONNECT');
  var $userInfo = $('<div>').append($userName).append($userDetails).append($callButton);

  $('#searchResults').append($userInfo);
};

$('#searchResults').on('click', '.connectButton', function(){
  var newRecipientId = $(this).siblings('h2').attr('id');
  var newCall = callsRef.push({
    active: true,
  });
  initiateCall(newCall.key(), newRecipientId);
});


//// USER CALL
var initiateCall = function(callId, callRecipientId){
  $('#callwindow').show();
  var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotesVideos',
    // immediately ask for camera access
    autoRequestMedia: true
  });
  // we have to wait until it's ready
  webrtc.on('readyToCall', function () {
    // you can name it anything
    webrtc.joinRoom(callId);
    console.log("joined room" + callId);

    var newRequest = requestsRef.push({
      recipient: callRecipientId,
      callId: callId,
    });
  });
};

var joinCall = function(callId){
  $('#callwindow').show();
  var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remotesVideos',
    // immediately ask for camera access
    autoRequestMedia: true
  });
  // we have to wait until it's ready
  webrtc.on('readyToCall', function () {
    // you can name it anything
    webrtc.joinRoom(callId);
    console.log("joined room" + callId);
  });
};












////
