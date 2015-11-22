$("#search input[type='number']").keypress(function (evt) {
    evt.preventDefault();
});

$('#userSearchForm').on('submit', function(e){
  e.preventDefault();
  var query = $("#query").val();
  var time = $("#query-time").val();
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
    $.get("/addConnectionToFirebase");
});

$('#hangup').click(function() {
    Twilio.Device.disconnectAll();
});

$('#searchResults').on('click', '.connectButton', function(){
    var callId = '',
        callerId = currentUserId,
        expertId = $(this).siblings('.userName').attr('id'),
        expertFee = $(this).parent('div').attr('data-fee');
    var call = new Call(callId, callerId, expertId, expertFee);
    $('.callBox-layer').show();
    var expert = call.expert();
    console.log(expert.phone);

    $('#makeCall').on('click', function(){
      console.log('calling', expert.phone);
      var connection = Twilio.Device.connect({
          CallerId:     '+19175887518',
          PhoneNumber:  expert.phone,
      });
      setInterval(function(){
        console.log(connection.mediaStream.callSid);
      }, 1000);
    });
});










////
