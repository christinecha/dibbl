



// var createCall = function(callId, callRecipientId, fee){
//   $('#search').hide();
//   $('#callwindow').show();
//   var totalfee;
//   var connectionTimeSec = 0;
//   var connectionTimeMin = 0;
//   var trackTime;
//   var waitSec = 0;
//   var waitTimer;
//   var webrtc = new SimpleWebRTC({
//     localVideoEl: 'localVideo',
//     remoteVideosEl: 'remotesVideos',
//     autoRequestMedia: true
//   });
//
//   // Tell us when we're connected to the server (only happens once!)
//   webrtc.on('readyToCall', function () {
//     serverConnected = true;
//     joinCall(callId);
//   });
//
//   var joinCall = function(callId){
//     var status;
//     // Join that call by Id.
//     webrtc.joinRoom(callId);
//     console.log("Joined Call #" + callId);
//     // We wait 30 seconds for the expert to accept the call.
//     waitTimer = setInterval(function(){
//       // If the Expert does not accept in 30 seconds:
//       if ((waitSec >= 30) || (status === 'declined')){
//         clearInterval(waitTimer);
//         leaveRoom(callId);
//         return false;
//       };
//       // otherwise, keep checking if it's been declined
//       callsRef.child(callId).once("value", function(snapshot){
//         status = snapshot.val().status;
//         console.log(status);
//       });
//       waitSec+= 1;
//       console.log('waiting... ', waitSec);
//     }, 1000);
//   };
//
//   var leaveRoom = function(callId) {
//     console.log('Left Call #', callId);
//     // destroy call in database
//     callsRef.child(callId).remove();
//     // leave call in webrtc
//     webrtc.stopLocalVideo();
//     webrtc.leaveRoom();
//     webrtc.disconnect();
//     // return to previous view
//     $('#search').show();
//     $('#callwindow').hide();
//   };
//
//   // if we've already connected (AKA not your first rodeo)
//   if (serverConnected == true) {
//     joinCall(callId);
//   } else {
//     // it's not connected yet, yo. Wait.
//   };
//
//   $('#hangup').on('click', function(){
//     clearInterval(waitTimer);
//     leaveRoom(callId);
//   });
//
//   var startMeter = function(){
//     callsRef.child(callId).update({
//       status: 'unpaid',
//     });
//     trackTime = setInterval(function(){
//       connectionTimeSec+= 1;
//       callsRef.child(callId).update({
//         length: connectionTimeSec,
//       });
//     }, 1000);
//   };
//
//   webrtc.on('videoAdded', function () {
//     clearInterval(waitTimer);
//     $('#callwindow .confirmation').show();
//     $('#callwindow .confirmation .accept').on('click', function(){
//       startMeter();
//       $('#remotesVideos').show();
//       $(this).parent('.confirmation').hide();
//     });
//   });
//
//   webrtc.on('videoRemoved', function () {
//     clearInterval(trackTime);
//     connectionTimeMin = Math.ceil(connectionTimeSec / 60);
//     totalfee = fee * connectionTimeMin;
//     chargeUser();
//   });
//
//   var chargeUser = function(){
//     console.log("charging user");
//     usersRef.child(currentUser.uid).on("value", function(snapshot){
//       var currentCustomerId = snapshot.val().customerId;
//       var data = {};
//       data.minutes = connectionTimeMin;
//       data.totalfeeCents = totalfee * 100;
//       data.customer = currentCustomerId;
//       console.log(data);
//       $.ajax({
//         type: "POST",
//         url: "/charge",
//         data: data,
//         success: function(data) {
//           console.log('success');
//         }, error: function(err) {
//           console.log('err', err);
//         }
//       });
//     });
//   };
// };
//
//
// //// ANSWER A REQUEST ------------------------------------------------------
//
// // Option 1: Accept the call.
// $('.notifications').on('click', '#acceptCall', function(){
//   var requestId = $(this).parent('.connection-request').attr('id');
//   var callId = $(this).parent('.connection-request').attr('data-callId');
//   requestsRef.child(requestId).remove();
//   $('.notifications').hide();
//   joinCall(callId);
// });
//
// // Option 2: Decline
// $('.notifications').on('click', '#declineCall', function(){
//   var requestId = $(this).parent('.connection-request').attr('id');
//   var callId = $(this).parent('.connection-request').attr('data-callId');
//   var memo = $(this).siblings('#memo').val();
//   requestsRef.child(requestId).remove();
//   $(this).parent('.connection-request').remove();
//   callsRef.child(callId).update({
//     memo: memo,
//     status: 'declined',
//   });
// });
//
// var joinCall = function(callId){
//   $('#callwindow').show();
//   var webrtc = new SimpleWebRTC({
//     localVideoEl: 'localVideo',
//     remoteVideosEl: 'remotesVideos',
//     autoRequestMedia: true
//   });
//
//   webrtc.on('readyToCall', function () {
//     webrtc.joinRoom(callId);
//     console.log("joined room" + callId);
//   });
//
//   $('#hangup').on('click', function(){
//     // leave call in webrtc
//     webrtc.stopLocalVideo();
//     webrtc.leaveRoom();
//     webrtc.disconnect();
//   });
// };
//
//
//
//
//
//






////
