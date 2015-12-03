$('#header').load('partials/header', function() {

  // Authorization & Loading Current User Info
  var authDataCallback = function(authData) {
    if (authData) {
      $('.secure').show();
      $('.public-only').hide();
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      usersRef.child(authData.uid).on("value", function(snapshot) {
        currentUser = snapshot.val();
        currentUserId = snapshot.key();
      });
    } else {
      console.log("User is logged out");
      currentUser = null;
      currentUserId = null;
      $('.secure').hide();
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


});

$('#header').on('click', '.account', function(){
  $(this).siblings('.dropdown-account').toggle();
});

$('#header').on('click', '.account-dashboard', function(){
  location.href = "/account?user=" + currentUserId;
});

$('#header').on('click', '.logout', function(){
  ref.unauth();
});







////
