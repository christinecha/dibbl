$('#header').load('partials/header', function() {

  // Authorization & Loading Current User Info
  var authDataCallback = function(authData) {
    if (authData) {
      $('.secure').show();
      $('.public-only').hide();
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      currentUserId = authData.uid;
      usersRef.child(authData.uid).on("value", function(snapshot) {
        currentUser = snapshot.val();
      });
      var user = new User();
      user.checkAvailability(authData.uid);
      user.loadMessages(authData.uid);
    } else {
      $('.secure').hide();
      console.log("User is logged out");
      currentUser = null;
      currentUserId = null;
      var path = window.location.pathname;
      console.log(path);
      if ( path.length > 1 ) {
        location.href = "/";
      } else {
        console.log('already home');
      };
    }
  };
  ref.onAuth(authDataCallback);

  $('#header').on('click', '.availability', function(){
    var user = new User();
    user.changeAvailability(currentUserId);
  });

  $('#header').on('click', '.account', function(){
    $(this).siblings('.dropdown-account').toggle();
  });

  $('#header').on('click', '.account-dashboard', function(){
    location.href = "/account?user=" + currentUserId + "&view=dashboard";
  });

  $('#header').on('click', '.account-inbox', function(){
    location.href = "/account?user=" + currentUserId + "&view=inbox";
  });

  $('#header').on('click', '.logout', function(){
    ref.unauth();
    location.href = "/";
  });
});


$('#footer').load('partials/footer', function() {
});






////
