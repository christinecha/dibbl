var searchQuery = [],
    searchResults = [],
    callId = '',
    callerId = currentUserId,
    expertId,
    expertFee;

Twilio.Device.setup(token);

// SET UP THE SEARCH QUERY ----------------------------------------------------------
$('.topicList li').on('click', function(){
  var selector = $(this).attr('data-selector');
  var selectorId = '#' + selector;
  $(selectorId).toggle();
});

$('.keyword').on('click', function(){
  $(this).toggleClass('selected');
  var keyword = $(this).attr('data-keyword');
  var index = searchQuery.indexOf(keyword);
  if (index < 0) {
    searchQuery.push(keyword);
  } else {
    searchQuery.splice(index, 1);
  };
  searchUsers(searchQuery);
});

var searchUsers = function(searchQuery) {
  $('#noSearchResults').hide();
  $('#searchResults').empty();
  for (var i = 0; i < searchQuery.length; i++) {
    ref.child('topics').child(searchQuery[i]).on("child_added", function(snapshot) {
      var userId = snapshot.key();
      var user = new User();
      user.displayAsSearchResult(userId);
    });
    if ($('#searchResults').children('.userInfo').length <= 0) {
      $('#noSearchResults').show();
    };
  };
};

$('#clearSearchQuery').on('click', function(e){
  e.preventDefault();
  $('.keyword.selected').removeClass('selected');
  $('#searchResults .userInfo').remove();
  searchResults = [];
  searchQuery = [];
  $('#noSearchResults').show();
  return false;
});


// INITIATE THE CALL ----------------------------------------------------------

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
      location.href = '/account?alert=no-cc&user=' + currentUserId + '&view=dashboard';
    };
  }.bind(this));
});

$('#searchResults').on('click', '.bookLaterButton', function() {
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
