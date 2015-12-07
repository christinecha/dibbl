var ref = new Firebase("https://dibbl.firebaseio.com");
var usersRef = ref.child("users");
var callsRef = ref.child("calls");
var currentUser;
var currentUserId;
var currentCall;
var serverConnected = false;

// Call Object

var Call = function(callObj) {
  this.call = callObj;
};

Call.prototype.expert = function() {
  var call = this.call;
  var expert;
  usersRef.child(call.expertId).once("value", function(snapshot){
    expert = snapshot.val();
    return expert;
  });
  return expert;
};

Call.prototype.displayInfo = function() {
  var call = this.call;
  var startTime = new Date(call.start_time);
      startTime = moment(startTime).format('MMM Do YYYY, h:mm:ss a');
  var endTime = new Date(call.end_time);
      endTime = moment(endTime).format('MMM Do YYYY, h:mm:ss a');

  var $startTime = $('<span>').html('from: ' + startTime).addClass('xsmall');
  var $endTime = $('<span>').html('to: ' + endTime).addClass('xsmall');
  var $status = $('<span>').text(call.status).addClass('small');
  var $paymentStatus = $('<span>').text(call.paymentStatus).addClass('small');

  var $callInfo = $('<div>').addClass('callInfo').append($startTime).append('<br>').append($endTime).append('<br>').append($status).append('<br>').append($paymentStatus);
  $('.call-history .subcategory').append($callInfo);
};

Call.prototype.triggerCallWindow = function() {
  var expert = this.expert();
  expertFee = expert.fee;

  $('#call-container').load('partials/call', function(){
    $('#expert--firstname').text(expert.firstname);
    $('#expert--fee').text(expertFee.toFixed(2));
  });

  $('#call-container').on('click', '.closeCallBox', function(){
    $('#call-container').empty();
  });

  $('#call-container').on('click', '#makeCall', function(){
    this.initiateCall(expert);
  }.bind(this));
};

Call.prototype.triggerBookingWindow = function() {
  var expert = this.expert();
  expertFee = expert.fee;

  $('#call-container').load('partials/call-booking', function(){
    $('#expert--firstname').text(expert.firstname);
    $('#expert--fee').text(expertFee.toFixed(2));
  });

  $('#call-container').on('click', '.booking-request .toggle', function(){
    $('.booking-request.memo').toggle();
    $('.booking-request.times').toggle();
  });

  $('#call-container').on('click', '.closeCallBox', function(){
    $('#call-container').empty();
  });

  $('#call-container').on('click', '#makeBookingRequest', function(){
    var memo = $('#booking-request--memo').val();
    var date1 = $('#booking-request--date1').val();
    var date2 = $('#booking-request--date2').val();
    var date3 = $('#booking-request--date3').val();
    var time1 = $('#booking-request--time1').val();
    var time2 = $('#booking-request--time2').val();
    var time3 = $('#booking-request--time3').val();
    var suggestedTimes = [
      { date: $('#booking-request--date1').val(),
        time: $('#booking-request--time1').val(),
      },
      { date: $('#booking-request--date2').val(),
        time: $('#booking-request--time2').val(),
      },
      { date: $('#booking-request--date3').val(),
        time: $('#booking-request--time3').val(),
      }
    ];
    this.makeBookingRequest(this.call.expertId, currentUserId, memo, suggestedTimes, status);
  }.bind(this));
};

Call.prototype.makeBookingRequest = function(expertId, callerId, memo, suggestedTimes, status) {
  ref.child('messages').push({
    from: callerId,
    to: expertId,
    subject: 'booking request',
    memo: memo,
    suggestedTimes: suggestedTimes,
    msgType: "booking request",
  });
};

Call.prototype.initiateCall = function(expert) {
  console.log('calling', expert.phone);
  this.showCallProgress();
  var connection = Twilio.Device.connect({
      CallerId:     '+13478366248',
      PhoneNumber:  expert.phone,
  });
};

Call.prototype.showCallProgress = function() {
  $('.call-request').hide();
  $('.call-progress').show();
  $('#call-progress--visualization').load('partials/blossoms', function(){
    var blossoms = $('#blossoms g');
    var index = 0;

    var growBlossom = setInterval(function() {
      blossoms.hide();
      if (index <= 3) {
        blossoms.eq(index).show();
        index+= 1;
      } else if ((index > 3) && (index < 8)) {
        blossoms.eq(3).show();
        index+= 1;
      } else if (index >= 8) {
        blossoms.eq(3).show();
        index = 0;
      };
    }, 500);
  });
};

Call.prototype.triggerReview = function() {
  var expertId = this.call.expertId;
  $('.call-progress').hide();
  $('.call-review').show();
  $('.call-review #callReviewForm').attr('data-expertId', expertId);
  $('.call-review .rating-container').load('partials/rating', function() {
    $('.call-review .rating-container .rating').css('font-size', '24px');
    $('.rating-container .rating .rating-star').on('click', function() {
      $(this).prevAll('.rating-star').switchClass('fa-star-o', 'fa-star').switchClass('fa-star-half-o', 'fa-star').attr('data-status', 'filled');
      $(this).nextAll('.rating-star').switchClass('fa-star', 'fa-star-o').switchClass('fa-star-half-o', 'fa-star-o').attr('data-status', 'empty');
      var status = $(this).attr('data-status');
      switch (status) {
        case 'empty':
          $(this).switchClass('fa-star-o', 'fa-star').attr('data-status', 'filled');
          break;
        case 'half':
          $(this).switchClass('fa-star-half-o', 'fa-star-o').attr('data-status', 'empty');
          break;
        case 'filled':
          $(this).switchClass('fa-star', 'fa-star-half-o').attr('data-status', 'half');
          break;
      };
    });
  });
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

User.prototype.checkAvailability = function(userId){
  ref.child("users").child(userId).once("value", function(snapshot) {
    var user = snapshot.val();
    $('#header .availability')
      .removeClass('offline')
      .removeClass('online')
      .addClass(user.availability);
    $('#header .availability span')
      .text(user.availability);
  });
};

User.prototype.changeAvailability = function(userId){
  ref.child("users").child(userId).once("value", function(snapshot) {
    var user = snapshot.val();
    var newAvailability;
    if (user.availability == 'offline') {
      newAvailability = 'online';
    } else {
      newAvailability = 'offline';
    };
    ref.child("users").child(userId).update({
      availability: newAvailability,
    });
    this.checkAvailability(userId);
  }.bind(this));
};

User.prototype.displayAsSearchResult = function(userId, user, time){
  var totalfee = '$' + (user.fee * time).toFixed(2);
  var $photo = $('<div>').addClass('userPhoto');
  if (user.photo) {
    $photo = $photo.css('background-image', 'url("' + user.photo + '")');
  };

  var $faveIcon = $('<i>').addClass('fa fa-heart faveIcon');
  var $userName = $('<h5>').html(user.firstname + ' ' + user.lastname).addClass('userName');
  var $userFee = $('<h5>').html(totalfee).addClass('userFee');
  var $rating = $('<div>').addClass('rating-container');
  var $userSkills = $('<div>').addClass('userSkills');
  for (var i = 0; i < user.skills.length; i++) {
    var $userSkill = $('<span>').html(user.skills[i]);
    $userSkills = $userSkills.append($userSkill);
  };
  var $userDetails = $('<p>').html(user.bio).addClass('userBio');
  var $callButton = $('<button class="connectButton small blue">').html('CONNECT NOW');
  var $bookLaterButton = $('<button class="bookLaterButton small dark-blue">').html('schedule a call');

  var $section1 = $('<div>')
    .addClass('col-md-4')
    .append($photo);
  var $section2 = $('<div>')
    .addClass('col-md-8')
    .append($faveIcon)
    .append($userName)
    .append($userFee)
    .append($rating)
    .append($userSkills)
    .append($userDetails)
    .attr('data-fee', user.fee);
  if (user.availability == "online") {
    $section2 = $section2.append($callButton);
  };
  $section2 = $section2.append($bookLaterButton);
  var $userInfo = $('<div>').addClass('userInfo row').append($section1).append($section2).attr('id', userId);
  $('#searchResults').append($userInfo);

  var ratingContainer = '#' + userId + ' .rating-container';
  this.displayRating(userId, ratingContainer);
};

User.prototype.loadCallHistory = function(userId) {
  callsRef.orderByChild('callerId').equalTo(userId).on("child_added", function(snapshot){
    var call = new Call(snapshot.val());
    call.displayInfo();
  });
};

User.prototype.loadMessages = function(userId) {
  ref.child('messages').orderByChild('to').equalTo(userId).on("child_added", function(snapshot) {
    var message = new Message(snapshot.val(), snapshot.key());
    message.displayInMessageList();
  });
};

User.prototype.displayRating = function(userId, containerId) {
  $(containerId).load('partials/rating', function() {
    usersRef.child(userId).once("value", function(snapshot) {
      var user = snapshot.val();

      if (user.rating) {
        var starRating = Math.round(user.rating.score * 2) / 2;
        var halfStars = starRating % 1;
        var wholeStars = starRating - halfStars;

        $(containerId + ' .rating .rating-star:lt(' + wholeStars + ')').each(function() {
          $(this).addClass('fa-star');
          $(this).removeClass('fa-star-o');
        });

        $(containerId + ' .rating .rating-star:eq(' + wholeStars + ')')
          .addClass('fa-star-half-o')
          .removeClass('fa-star-o');
      } else {
        $(containerId + ' .rating').append('<span class="xsmall">&nbsp; &nbsp; NOT YET RATED</span>');
      };
    });
  });
};

User.prototype.updateRating = function(userId, rating) {
  usersRef.child(userId).once("value", function(snapshot) {
    var user = snapshot.val();
    var oldRating = user.rating.score;
    var oldNumOfRatings = user.rating.numOfRatings;
    console.log('old', oldRating);
    console.log('new', rating);

    var newNumOfRatings = oldNumOfRatings + 1;
    var newRating = ((oldRating * oldNumOfRatings) + rating) / newNumOfRatings;

    usersRef.child(userId).child('rating').update({
      numOfRatings: newNumOfRatings,
      score: newRating,
    });
    console.log('averaged', newRating);
  });
};

User.prototype.addComment = function(userId, comment) {
  usersRef.child(userId).child('comments').push({
    comment: comment,
    from: currentUserId,
  });
};

// Message Object
var Message = function(obj, key) {
  this.id = key;
  this.to = obj.to;
  this.from = obj.from;
  this.msgType = obj.msgType;
  this.memo = obj.memo;
  this.subject = obj.subject;
  this.suggestedTimes = obj.suggestedTimes;
  this.status = obj.status;
  this.confirmedDate = obj.confirmedDate;
  this.confirmedTime = obj.confirmedTime;
};

Message.prototype.displayInMessageList = function() {
  var $messageFrom = $('<div>')
    .addClass('messageFrom')
    .html('from: ' + this.from);

  var $messageSubject = $('<div>')
    .addClass('messageSubject')
    .html(this.subject);

  var $messagePreview = $('<div>')
    .attr('id', this.id)
    .addClass('messagePreview')
    .append($messageFrom)
    .append($messageSubject);

  $('#inbox--messages-list').append($messagePreview);
};

Message.prototype.displaySingle = function(){
  $('#inbox--message-preview').empty();

  var $messageFrom = $('<div>')
    .addClass('messageFrom')
    .html('from: ' + this.from);

  var $messageSubject = $('<div>')
    .addClass('messageSubject')
    .html(this.subject);

  if (this.msgType == "booking request") {

    var $messageMemo = $('<div>')
      .addClass('messageMemo')
      .html(this.memo);

    var $messageTimes = $('<div>').addClass('messageTimes');

    if (this.status == "confirmed") {
      var $messageDate = $('<div>').html(this.confirmedDate);
      var $messageTime = $('<div>').html(this.confirmedTime);
      var $cancelBooking = $('<button>').html('cancel booking').addClass('cancelBooking small orange');
      $messageTimes = $messageTimes.append($messageDate).append($messageTime).append($cancelBooking);
    } else {
      for (var i = 0; i < this.suggestedTimes.length; i++) {
        var $messageDate = $('<span>').html(this.suggestedTimes[i].date).addClass('date');
        var $messageTime = $('<span>').html(' at ' + this.suggestedTimes[i].time).addClass('time');
        var $chooseTime = $('<input>')
          .attr('type', 'radio')
          .attr('name', 'booking-time')
          .attr('value', i);
        var $messageDateTime = $('<div>')
          .addClass('option')
          .append($messageDate)
          .append($messageTime)
          .append($chooseTime);
        $messageTimes = $messageTimes.append($messageDateTime);
      };
      var $confirmBooking = $('<button>').html('confirm booking').addClass('confirmBooking small blue');
      var $declineBooking = $('<button>').html('decline booking').addClass('declineBooking small orange');
      $messageTimes = $messageTimes.append($confirmBooking).append($declineBooking);
    };
  };

  var $message = $('<div>')
    .addClass('message')
    .attr('id', this.id)
    .append($messageFrom)
    .append($messageSubject)
    .append($messageMemo)
    .append($messageTimes);

  $('#inbox--message-preview').append($message);
};
