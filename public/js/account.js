var authCheck = setInterval(function(){
  if (currentUserId) {
    clearInterval(authCheck);

    //// PROFILE ------------------------------------------------------
    usersRef.child(currentUserId).once("value", function(snapshot) {
      var user = snapshot.val();
      $('#account--firstname').val(user.firstname);
      $('#account--lastname').val(user.lastname);
      $('#account--email').val(user.email);
      if (user.photo) {
        $('.account--profilephoto').css('background-image', 'url("' + user.photo + '")')
      };
    });

    $('#updatePersonalInfo').on('submit', function() {
      var firstname = $('#account--firstname').val();
      var lastname = $('#account--lastname').val();
      var email = $('#account--email').val();
      var photo = $('.account--profilephoto').val();
      photo = photo.substring(photo.lastIndexOf("\\") + 1, photo.length);

      usersRef.child(currentUserId).update({
        firstname: firstname,
        lastname: lastname,
        email: email,
      });
    });

    $('.account--profilephoto').on('click', function(){
      $('#profilePhotoUpload').click();
    });

    $('#profilePhotoUpload').on('change', function(){
      var file = $(this)[0].files[0];
      var filename = $(this).val();
      filename = filename.replace('C:\\fakepath\\', '');
      var reader = new FileReader();
      reader.onloadend = function() {
        usersRef.child(currentUserId).update({
          photo:reader.result,
        });
        $('.account--profilephoto').css('background-image', 'url("' + reader.result + '")')
      };

      reader.readAsDataURL(file);
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



  };
}, 1000);
