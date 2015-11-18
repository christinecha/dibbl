$('.alreadyUser').on('click', function(){
  $('#login-signup').attr('data-function', 'login');
  $('.login-only').show();
  $('.signup-only').hide();
});

$('.notUserYet').on('click', function(){
  $('#login-signup').attr('data-function', 'signup');
  $('.signup-only').show();
  $('.login-only').hide();
});

//Sign Up With Email
$('#login-signup').on('submit', function(e){
  console.log('he');
  e.preventDefault();
  var firstname = $('#firstname').val(),
      lastname = $('#lastname').val(),
      email = $('#email').val(),
      password = $('#password').val();
  var user = new User();
  if ($(this).attr('data-function') == 'signup'){
    console.log("trying to sign you up");
    user.signupWithEmail(firstname, lastname, email, password);
  } else {
    console.log("trying to log you in");
    user.loginWithEmail(email, password);
  }
  return false;
});

// Log out
$('#header').on('click', '.logout', function(){
  ref.unauth();
});





/////////
