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
  $('.call-progress').hide();
  $('.call-review').show();
  $.post("/processCall", {
    callId: connection.mediaStream.callSid,
    currentUserId: currentUserId,
    expertId: expertId,
    expertFee: expertFee,
  });
  location.href = "/account?user=" + currentUserId;
});

$('#call-container').on('click', '#hangup', function() {
    Twilio.Device.disconnectAll();
});

$('#searchResults').on('click', '.connectButton', function() {
  usersRef.child(currentUserId).once("value", function(snapshot) {
    var user = snapshot.val();

    if (user.customerId) {
      callerId = currentUserId;
      expertId = $(this).parent('.userInfo').attr('id');
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

var initiateCall = function(expert) {
  console.log('calling', expert.phone);
  showCallProgress();
  var connection = Twilio.Device.connect({
      CallerId:     '+19175887518',
      PhoneNumber:  expert.phone,
  });
};

var showCallProgress = function() {
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








////
