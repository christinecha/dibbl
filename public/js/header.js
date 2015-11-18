$('#header').load('/header', function(){

  // Authorization & Loading Current User Info
  var authDataCallback = function(authData){
    if (authData) {
      $('.secure').show();
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      usersRef.child(authData.uid).on("value", function(snapshot){
        currentUser = snapshot.val();
        currentUserId = snapshot.key();
        var user = new User();
        user.loadIncomingCalls(currentUserId);
      });
    } else {
      console.log("User is logged out");
      currentUser = null;
      currentUserId = null;
      $('.secure').hide();
      if ( window.location.pathname.length > 1 ) {
        location.href = "/";
      } else {
        console.log('already home');
      };
    }
  };

  ref.onAuth(authDataCallback);

  $('.notifications-icon').on('click', function(){
    $('.menu').hide();
    $('.notifications').toggle();
  });

  $('.menu-icon').on('click', function(){
    $('.notifications').hide();
    $('.menu').toggle();
  });

  $('.page-nav').on('click', function(){
    var page = $(this).attr('data-page');
    var pageId = '#' + page;
    $('.menu').hide();
    $('.page').hide();
    $(pageId).show();
  });

  $('#header').on('click', '#holdCall', function(){
      var holdTime = $('#holdTime').val();
      var callId = $(this).parent().parent().attr('id');
      console.log(callId);

      if (holdTime) {
          var call = new Call();
          call.hold(callId);
      } else {
          console.log('please fill out the hold time');
          return false;
      }
  });

  $('#header').on('click', '#acceptCall', function(){
      var callId = $(this).parent().parent().attr('id');
      var call = new Call();
      call.accept(callId);
      console.log('accepting call');
  });

  $('#header').on('click', '#declineCall', function(){
      var callId = $(this).parent().parent().attr('id');
      var call = new Call();
      call.decline(callId);
  });



});
