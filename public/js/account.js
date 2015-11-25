//// PROFILE ------------------------------------------------------
$('#addSkills').on('submit', function(){
  var skill = $('#skill').val();
  usersRef.child(currentUserId).child("skills").child(skill).set(true);
});

// PAYMENT ------------------------------------------------------------------------

if (currentUserId) {
  usersRef.child(currentUserId).child("customerId").once("value", function(snapshot){
    if (snapshot.val()) {
      $(".saved-cards").show();
    } else {
      $(".saved-cards").hide();
    }
  });
};

function stripeResponseHandler(status, response) {
  var $form = $('#addPaymentMethod');
  if (response.error) {
    console.log('error in handler');
    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false);
  } else {
    console.log(response);
    var token = response.id;
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    $form.append($('<input type="hidden" name="userId" />').val(currentUserId));
    $form.get(0).submit();
  }
};

jQuery(function($) {
  $('#addPaymentMethod').submit(function(event) {
    event.preventDefault();
    var $form = $(this);
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken($form, stripeResponseHandler);
    return false;
  });
});
