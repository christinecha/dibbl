// //// USER SEARCH ------------------------------------------------------
// var suggestedtopics = ['photoshop', 'jazz guitar', 'making sushi', 'yoga poses'];
// var b = 0;
// setInterval(function(){
//   $('#query').attr('placeholder', suggestedtopics[b]);
//   if (b < 3) {
//     b+= 1;
//   } else {
//     b = 0;
//   }
// }, 2000);


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

$('#searchResults').on('click', '.connectButton', function(){
  var callId = '',
      callerId = currentUserId,
      expertId = $(this).siblings('.userName').attr('id'),
      expertFee = $(this).parent('div').attr('data-fee');
  var call = new Call(callId, callerId, expertId, expertFee);
  call.create();
});
