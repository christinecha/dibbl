$('.alreadyUser').on('click', function(){
  $('#signup').attr('id', 'login');
  $('.login-only').show();
  $('.signup-only').hide();
});

$('.notUserYet').on('click', function(){
  $('#login').attr('id', 'signup');
  $('.signup-only').show();
  $('.login-only').hide();
});

//Sign Up With Email
$('#signup').on('submit', function(e){
  e.preventDefault();
  var firstname = $('#firstname').val(),
      lastname = $('#lastname').val(),
      email = $('#email').val(),
      password = $('#password').val();
  var user = new User();
  user.signupWithEmail(firstname, lastname, email, password);
  return false;
});

// Log In
$('#login').on('submit', function(e){
  e.preventDefault();
  var email = $('#email').val(),
      password = $('#password').val();
  var user = new User();
  user.loginWithEmail(email, password);
  return false;
});

// Log out
$('#header').on('click', '.logout', function(){
  ref.unauth();
});





/////////
