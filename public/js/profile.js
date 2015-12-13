Twilio.Device.setup(token);

// TRIGGER THE CALL WINDOW ----------------------------------------------------------

$('.profile').on('click', '.connectButton', function() {
  ref.child('users').child(currentUserId).once("value", function(snapshot) {
    var user = snapshot.val();

    if (user.customerId) {
      callerId = currentUserId;
      expertId = $(this).parent().parent('.userInfo').attr('id');
      console.log(expertId);
      var call = new Call({
          callerId: callerId,
          expertId: expertId,
      });
      call.triggerCallWindow();
    } else {
      location.href = '/account?alert=no-cc&user=' + currentUserId + '&view=dashboard';
    };
  }.bind(this));
});

$('.profile').on('click', '.bookLaterButton', function() {
  ref.child('users').child(currentUserId).once("value", function(snapshot) {
    var user = snapshot.val();
    if (user.customerId) {
      callerId = currentUserId;
      expertId = $(this).parent().parent('.userInfo').attr('id');
      console.log(expertId);
      var call = new Call({
          callerId: callerId,
          expertId: expertId,
      });
      call.triggerBookingWindow();
    } else {
      location.href = '/account?alert=no-cc&user=' + currentUserId + '&view=dashboard';
    };
  }.bind(this));
});


$('#call-container').on('submit', '#callReviewForm', function(e) {
  e.preventDefault();
  console.log('submitting form');
  var expertId = $(this).attr('data-expertId');
  var wholeStars = $(this).children('.rating-container').find('.rating-star.fa-star').length;
  var halfStars = $(this).children('.rating-container').find('.rating-star.fa-star-half-o').length;
  var starRating = wholeStars + halfStars;
  var comment = $(this).find('#callreview--comment').val();

  var user = new User();
  user.updateRating(expertId, starRating);
  user.addComment(expertId, comment);
  location.href = '/account?user=' + currentUserId;

  return false;
});


Twilio.Device.disconnect(function(connection) {
  var callObj = {
    callId: connection.mediaStream.callSid,
    currentUserId: currentUserId,
    expertId: expertId,
    expertFee: expertFee,
  };
  $.post("/processCall", callObj)
    .done(function(){
      console.log('successfully processed call');
    });
  var call = new Call(callObj);
  call.triggerReview();
});

$('#call-container').on('click', '#hangup', function() {
    Twilio.Device.disconnectAll();
});








////
