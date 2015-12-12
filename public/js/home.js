$('.mailinglist-container').hide();
$('.login-container').hide();
$('.signup-only').hide();

$("#exampleUseCases").typed({
    strings: [
      "a world-renowned guitarist",
      "a celebrated chef",
      "an award-winning poet"
    ],
    contentType: 'text',
    showCursor: 'false',
    backDelay: 2000,
    loop: true,
    typeSpeed: 50,
});

$('#mailinglist').on('submit', function(e){
  e.preventDefault();
  var email = $('#mailinglist-email').val();
  console.log(email);
  ref.child('mailinglist').push({
    email:  email,
    addedAt: Firebase.ServerValue.TIMESTAMP,
    for: 'closed beta',
  });
  $('.confirmation-container').html('<h4>Yay! You\'ve been added to the list.</h4>');
  $('#mailinglist-email').val('');
  return false;
});

$('#header').on('keyup', function(){
  var password = $(this).find('#beta-password').val();
  console.log(password);
  if (password == 'vip only') {
    console.log('got it!');
    $('.search-container').hide();
    $('.mailinglist-container').hide();
    $('.login-container').show();
  } else {
    $('.login-container').hide();
    $('.search-container').show();
  }
});

$('.alreadyUser').on('click', function(){
  $('#login').attr('data-function', 'login');
  $('.login-only').show();
  $('.signup-only').hide();
});

$('.notUserYet').on('click', function(){
  $('#login').attr('data-function', 'signup');
  $('.signup-only').show();
  $('.login-only').hide();
});

//Sign Up With Email
$('#login').on('submit', function(e){
  e.preventDefault();
  var firstname = $('#firstname').val(),
      lastname = $('#lastname').val(),
      email = $('#email').val(),
      password = $('#password').val();
      console.log('1', email);
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






/////////
