$(function(){
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
