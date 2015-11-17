$('#searchResults').on('click', '.connectButton', function(){
  var callId = '',
      callerId = currentUser.uid,
      expertId = $(this).siblings('.userName').attr('id'),
      expertFee = $(this).parent('div').attr('data-fee');
  var call = new Call(callId, callerId, expertId, expertFee);
  call.addToFirebase();
});

callsRef.orderByChild('expertId').equalTo(currentUser.uid).once("child_added", function(snapshot){
  var call = snapshot.val();
  var incomingCall = new Call(snapshot.key(), call.callerId, call.expertId, call.expertFee);
  incomingCall.displayIncoming();
});
