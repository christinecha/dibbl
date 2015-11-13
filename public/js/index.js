
// GLOBAL VARIABLES ---------------------------------------------
var ref = new Firebase("https://dibbl.firebaseio.com");
var usersRef = ref.child("users");
var callsRef = ref.child("calls");
var requestsRef = ref.child("requests");
var currentUser;
var currentCall;
var serverConnected = false;


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
        location.href = "/";
      });
    }
  });

});

// Log In
$('#login').on('submit', function(e){
  e.preventDefault();
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
      location.href = "/";
    }
  });

  return false;
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
      $('#account #firstname').text(currentUserObj.firstname);
      $('#account #lastname').text(currentUserObj.lastname);
      currentUserRef.child("skills").on("child_added", function(childSnapshot){
        var $skill = $('<h4>').text(childSnapshot.key());
        $('#account #skills').append($skill);
      });
    });
  } else {
    console.log("User is logged out");
    currentUser = {};
    currentUserId = '';
    currentUserObj = {};
    currentGroup = '';
    currentGroupName = '';
    if ( window.location.href.indexOf("login") > -1 ) {
      //do nothing
    } else {
      location.href = "login";
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
  location.href = "/";
});

//// NAVIGATION ------------------------------------------------------
$('.notifications-icon').on('click', function(){
  $('.menu').hide();
  $('.notifications').toggle();
});

$('.menu-icon').on('click', function(){
  $('.notifications').hide();
  $('.menu').toggle();
});


$('.page-nav').on('click', function(){
  var page = $(this).attr('data-page');
  var pageId = '#' + page;
  $('.menu').hide();
  $('.page').hide();
  $(pageId).show();
});

//// DISPLAY REQUESTS ----------------------------------------------------

requestsRef.orderByChild('recipient').equalTo(currentUser.uid).on("child_added", function(snapshot){
  var request = snapshot.val();
  var requestId = snapshot.key();
  var sender;
  usersRef.child(request.sender).once("value", function(senderSnapshot){
    sender = senderSnapshot.val();
    var $accept = $('<button>').text('accept').attr('id', 'acceptCall');
    var $memo = $('<input>').attr('type', 'text').attr('id', 'memo');
    var $decline = $('<button>').text('decline').attr('id', 'declineCall');
    var $request = $('<div>').html('REQUEST FROM ' + sender.firstname + ' ' + sender.lastname).addClass('connection-request').attr('id', requestId).attr('data-callId', request.callId).append($accept).append($memo).append($decline);
    $('.notifications').append($request);
    $('.notifications-icon').addClass('hasNotifications');
    $('.notifications-number').html($('#requests').children().length);
    $('.notifications').show();
  });
});

//// PROFILE ------------------------------------------------------
$('#skillsForm').on('submit', function(){
  var skill = $('#skill').val();
  usersRef.child(currentUser.uid).child("skills").child(skill).set(true);
});

// PAYMENT ------------------------------------------------------------------------

usersRef.child(currentUser.uid).child("customerId").once("value", function(snapshot){
  if (snapshot.val() == null) {
    $("#payment-form").show();
    $(".saved-cards").hide();
  } else {
    $("#payment-form").hide();
    $(".saved-cards").show();
  }
})

function stripeResponseHandler(status, response) {
  var $form = $('#payment-form');

  if (response.error) {
    console.log('error in handler');
    // Show the errors on the form
    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false);
  } else {
    console.log(response);
    // response contains id and card, which contains additional card details
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    $form.append($('<input type="hidden" name="userId" />').val(currentUser.uid));
    // and submit
    $form.get(0).submit();
  }
};

jQuery(function($) {
  $('#payment-form').submit(function(event) {
    event.preventDefault();
    var $form = $(this);
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken($form, stripeResponseHandler);
    return false;
  });
});

//// USER SEARCH ------------------------------------------------------
var suggestedtopics = ['photoshop', 'jazz guitar', 'making sushi', 'yoga poses'];
var b = 0;
setInterval(function(){
  $('#query').attr('placeholder', suggestedtopics[b]);
  if (b < 3) {
    b+= 1;
  } else {
    b = 0;
  }
}, 2000);

$("#search input[type='number']").keypress(function (evt) {
    evt.preventDefault();
});

$('#userSearchForm').on('submit', function(){
  $('.initial-view').addClass('standard-view').removeClass('initial-view');
  $('.searchFilter').show();
  $('#searchResults').empty();
  var query = $("#query").val();
  var time = $("#query-time").val();
  console.log('searching for an expert in ' + query);

  usersRef.orderByChild("skills/" + query).equalTo(true).on("child_added", function(snapshot){
    var matchedUser = snapshot.val();
    displayMatchedUsers(snapshot.key(), matchedUser.firstname, matchedUser.lastname, matchedUser.skills, matchedUser.info, matchedUser.fee, time);
  })

  return false;
});

var displayMatchedUsers = function(id, firstname, lastname, skills, info, fee, time){
  console.log('working?', firstname);
  var totalfee = fee * time;
  totalfee = totalfee.toFixed(2);
  totalfee = '$' + totalfee;

  var $faveIcon = $('<i>').addClass('fa fa-heart faveIcon');
  var $userName = $('<h5>').html(firstname + ' ' + lastname).attr('id', id).addClass('userName');
  var $rating = $('<div>').addClass('rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i>');
  var $userFee = $('<h5>').text(totalfee).addClass('userFee');
  var $userSkills = $('<div>').addClass('userSkills');
  var skillsArray = Object.keys(skills);
  for (var i = 0; i < skillsArray.length; i++) {
    var $userSkill = $('<span>').html(skillsArray[i]);
    $userSkills = $userSkills.append($userSkill);
  };
  var $userDetails = $('<p>').text(info);
  var $callButton = $('<button class="connectButton">').text('CONNECT');
  var $userInfo = $('<div>').addClass('userInfo').append($faveIcon).append($userName).append($rating).append($userFee).append($userSkills).append($userDetails).append($callButton).attr('data-fee', fee);

  $('#searchResults').append($userInfo);
};



//// MAKE A REQUEST ------------------------------------------------------

var createRequest = function(callId, recipientId, fee){
  var newRequest = requestsRef.push({
    callId: callId,
    recipient: recipientId,
    sender: currentUser.uid,
    fee: fee,
  });
};

// On "CONNECT", User triggers a new Request with that specific Expert.
$('#searchResults').on('click', '.connectButton', function(){
  // We collect data about the Expert.
  var recipientId = $(this).siblings('.userName').attr('id');
  var fee = $(this).parent('div').attr('data-fee');
  // User creates a new Call Object.
  var newCall = callsRef.push({
    recipient: recipientId,
    sender: currentUser.uid,
    initiatedAt: Firebase.ServerValue.TIMESTAMP,
  });
  createCall(newCall.key(), recipientId, fee);
  // User creates a new Request Object for that new Call Id.
  createRequest(newCall.key(), recipientId, fee);
});

var createCall = function(callId, callRecipientId, fee){
  $('#search').hide();
  $('#callwindow').show();
  var totalfee;
  var connectionTimeSec = 0;
  var connectionTimeMin = 0;
  var trackTime;
  var waitSec = 0;
  var waitTimer;
  var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remotesVideos',
    autoRequestMedia: true
  });

  // Tell us when we're connected to the server (only happens once!)
  webrtc.on('readyToCall', function () {
    serverConnected = true;
    joinCall(callId);
  });

  var joinCall = function(callId){
    var status;
    // Join that call by Id.
    webrtc.joinRoom(callId);
    console.log("Joined Call #" + callId);
    // We wait 30 seconds for the expert to accept the call.
    waitTimer = setInterval(function(){
      // If the Expert does not accept in 30 seconds:
      if ((waitSec >= 30) || (status === 'declined')){
        clearInterval(waitTimer);
        leaveRoom(callId);
        return false;
      };
      // otherwise, keep checking if it's been declined
      callsRef.child(callId).once("value", function(snapshot){
        status = snapshot.val().status;
        console.log(status);
      });
      waitSec+= 1;
      console.log('waiting... ', waitSec);
    }, 1000);
  };

  var leaveRoom = function(callId) {
    console.log('Left Call #', callId);
    // destroy call in database
    callsRef.child(callId).remove();
    // leave call in webrtc
    webrtc.stopLocalVideo();
    webrtc.leaveRoom();
    webrtc.disconnect();
    // return to previous view
    $('#search').show();
    $('#callwindow').hide();
  };

  // if we've already connected (AKA not your first rodeo)
  if (serverConnected == true) {
    joinCall(callId);
  } else {
    // it's not connected yet, yo. Wait.
  };

  $('#hangup').on('click', function(){
    clearInterval(waitTimer);
    leaveRoom(callId);
  });

  var startMeter = function(){
    callsRef.child(callId).update({
      status: 'unpaid',
    });
    trackTime = setInterval(function(){
      connectionTimeSec+= 1;
      callsRef.child(callId).update({
        length: connectionTimeSec,
      });
    }, 1000);
  };

  webrtc.on('videoAdded', function () {
    clearInterval(waitTimer);
    $('#callwindow .confirmation').show();
    $('#callwindow .confirmation .accept').on('click', function(){
      startMeter();
      $('#remotesVideos').show();
      $(this).parent('.confirmation').hide();
    });
  });

  webrtc.on('videoRemoved', function () {
    clearInterval(trackTime);
    connectionTimeMin = Math.ceil(connectionTimeSec / 60);
    totalfee = fee * connectionTimeMin;
    chargeUser();
  });

  var chargeUser = function(){
    console.log("charging user");
    usersRef.child(currentUser.uid).on("value", function(snapshot){
      var currentCustomerId = snapshot.val().customerId;
      var data = {};
      data.minutes = connectionTimeMin;
      data.totalfeeCents = totalfee * 100;
      data.customer = currentCustomerId;
      console.log(data);
      $.ajax({
        type: "POST",
        url: "/charge",
        data: data,
        success: function(data) {
          console.log('success');
        }, error: function(err) {
          console.log('err', err);
        }
      });
    });
  };
};


//// ANSWER A REQUEST ------------------------------------------------------

// Option 1: Accept the call.
$('.notifications').on('click', '#acceptCall', function(){
  var requestId = $(this).parent('.connection-request').attr('id');
  var callId = $(this).parent('.connection-request').attr('data-callId');
  requestsRef.child(requestId).remove();
  $('.notifications').hide();
  joinCall(callId);
});

// Option 2: Decline
$('.notifications').on('click', '#declineCall', function(){
  var requestId = $(this).parent('.connection-request').attr('id');
  var callId = $(this).parent('.connection-request').attr('data-callId');
  var memo = $(this).siblings('#memo').val();
  requestsRef.child(requestId).remove();
  $(this).parent('.connection-request').remove();
  callsRef.child(callId).update({
    memo: memo,
    status: 'declined',
  });
});

var joinCall = function(callId){
  $('#callwindow').show();
  var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remotesVideos',
    autoRequestMedia: true
  });

  webrtc.on('readyToCall', function () {
    webrtc.joinRoom(callId);
    console.log("joined room" + callId);
  });

  $('#hangup').on('click', function(){
    // leave call in webrtc
    webrtc.stopLocalVideo();
    webrtc.leaveRoom();
    webrtc.disconnect();
  });
};












////
