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
        location.href = "/";
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
      location.href = "/";
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
  $('.notifications').toggle();
});

$('.menu-icon').on('click', function(){
  $('.menu').toggle();
});


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
  $('.notifications-icon').css('color', 'red');
  $('.notifications').show();
  alert('you\'ve got a connection request!');
});

$('#requests').on('click', 'button', function(){
  var requestId = $(this).attr('id');
  var callId = $(this).attr('data-callId');
  requestsRef.child(requestId).remove();
  $('.notifications-icon').css('color', 'white');
  $('.notifications').hide();
  joinCall(callId);
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
$('#userSearchForm').on('submit', function(){
  var query = $("#query").val();
  console.log('searching for an expert in ' + query);

  usersRef.orderByChild("skills/" + query).equalTo(true).on("child_added", function(snapshot){
    var matchedUser = snapshot.val();
    displayMatchedUsers(snapshot.key(), matchedUser.firstname, matchedUser.lastname, matchedUser.info, matchedUser.fee);
  })

  return false;
});

var displayMatchedUsers = function(id, firstname, lastname, info, fee){
  $('#searchResults').empty();
  console.log('working?', firstname);

  var $userName = $('<h2>').html(firstname + ' ' + lastname).attr('id', id).addClass('userName');
  var $userDetails = $('<p>').text(info);
  var $callButton = $('<button class="connectButton">').text('CONNECT');
  var $userInfo = $('<div>').append($userName).append($userDetails).append($callButton).attr('data-fee', fee);

  $('#searchResults').append($userInfo);
};

$('#searchResults').on('click', '.connectButton', function(){
  $('.page #searchResults').hide();
  var newRecipientId = $(this).siblings('h2').attr('id');
  var fee = $(this).parent('div').attr('data-fee');
  var newCall = callsRef.push({
    active: true,
  });
  initiateCall(newCall.key(), newRecipientId, fee);
});


//// USER CALL ------------------------------------------------------------------------
var initiateCall = function(callId, callRecipientId, fee){
  $('#callwindow').show();
  var totalfee;
  var connectionTimeSec = 0;
  var connectionTimeMin = 0;
  var trackTime;

  var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remotesVideos',
    autoRequestMedia: true
  });

  webrtc.on('readyToCall', function () {
    webrtc.joinRoom(callId);
    console.log("joined room" + callId);

    var newRequest = requestsRef.push({
      recipient: callRecipientId,
      callId: callId,
      fee: fee,
    });
  });

  webrtc.on('videoAdded', function () {
    trackTime = setInterval(function(){
      connectionTimeSec+= 1;
      console.log("# seconds used: ", connectionTimeSec);
    }, 1000);
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
};













////
