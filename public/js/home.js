$('.mailinglist-container').hide();

$('#search').on('submit', function(e){
  e.preventDefault();
  // var query = $("#query").val();
  // var time = $("#query-time").val();
  // location.href = "/search" + query + time;

  // temporarily redirects to mailing list sign up
  $('.search-container').hide();
  $('.mailinglist-container').show();
  return false;
});

$('#mailinglist').on('submit', function(e){
  e.preventDefault();
  var email = $('#email').val();
  ref.child('mailinglist').push({
    email:  email,
    addedAt: Firebase.ServerValue.TIMESTAMP,
    for: 'closed beta',
  });
  $('.confirmation-container').html('<h4>Yay! You\'ve been added to the list.</h4>');
  $('#email').val('');
  return false;
});
