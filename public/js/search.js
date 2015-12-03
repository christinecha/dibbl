var callId = '',
    callerId = currentUserId,
    expertId,
    expertFee;

$("#search input[type='number']").keypress(function (evt) {
    evt.preventDefault();
});

$('#userSearchForm').on('submit', function(e){
  e.preventDefault();
  var query = $("#query").val();
  var time = $("#query-time").val();
  $('#searchResults').empty();
  usersRef.on("child_added", function(snapshot){
    var userObj = snapshot.val();
    var skills = userObj.skills;
    if (skills) {
      if (skills.indexOf(query) < 0) {
        // do nothing;
      } else {
        var user = new User();
        user.displayAsSearchResult(snapshot.key(), userObj, time);
      }
    };
  });
  return false;
});

Twilio.Device.setup(token);

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

$('#searchResults').on('click', '.connectButton', function() {
  usersRef.child(currentUserId).once("value", function(snapshot) {
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
      location.href = '/account?alert=no-cc?user=' + currentUserId;
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








////
