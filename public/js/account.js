var authCheck = setInterval(function(){
  if (currentUserId) {
    clearInterval(authCheck);
    var fnString = 'loadAccount_' + view;
    var fn = window[fnString];
    if (typeof fn === "function") {
      fn();
    };
  }
}, 20);

//// SETTINGS ------------------------------------------------------
var loadAccount_dashboard = function() {
  $('#account-content').empty();
  $('.account .view-title').text('ACCOUNT DASHBOARD');
  $('#account-content').load('/partials/account-dashboard', function() {

    usersRef.child(currentUserId).once("value", function(snapshot) {
      var user = snapshot.val();
      $('#account--firstname').val(user.firstname);
      $('#account--lastname').val(user.lastname);
      $('#account--email').val(user.email);

      if (user.photo) {
        $('.account--profilephoto').css('background-image', 'url("' + user.photo + '")')
      };
    });

    var user = new User();
    user.loadCallHistory(currentUserId);

    $('#updatePersonalInfo').on('submit', function(e) {
      e.preventDefault();
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
      location.reload();
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
    if (alert == 'no-cc') {
      $('.payment-methods .subcategory').css('border', '6px solid #66cccc');
      $('.payment-methods .subcategory').prepend('<p class="xsmall">please enter a payment method to continue.</p><br>');
    };

    if (currentUserId) {
      usersRef.child(currentUserId).child("customerId").once("value", function(snapshot){
        if (snapshot.val()) {
          $(".saved-cards").show();
          $(".saved-cards").append(defaultCard_brand + ' x' + defaultCard_last4);
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
        location.href = '/account?user=' + currentUserId + '&view=dashboard';
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

  });
};

var loadAccount_inbox = function() {
  $('#account-content').empty();
  $('.account .view-title').text('INBOX');
  $('#account-content').load('/partials/account-inbox', function() {
    var user = new User();
    user.loadMessages(currentUserId);

    $('#inbox--messages-list').on('click', '.messagePreview', function(){
      var messageId = $(this).attr('id');
      ref.child('messages').child(messageId).once("value", function(snapshot) {
        var message = new Message (snapshot.val(), messageId);
        message.displaySingle();
      });
    });

    $('#inbox--message-preview').on('click', '.confirmBooking', function() {
      var messageId = $(this).parent().parent('.message').attr('id');
      var messageTimes = $(this).parent('.messageTimes');
      var chosenIndex = messageTimes.find('input[type=radio]:checked').val();
      if (chosenIndex) {
        ref.child('messages').child(messageId).once("value", function(snapshot) {
          var message = snapshot.val();
          var confirmedDate = message.suggestedTimes[chosenIndex].date;
          var confirmedTime = message.suggestedTimes[chosenIndex].time;
          ref.child('messages').child(messageId).update({
            confirmedDate: confirmedDate,
            confirmedTime: confirmedTime,
            status: 'confirmed',
          });
          console.log('confirmed');
          ref.child('messages').push({
            childMsg: messageId,
            from: currentUserId,
            to: message.from,
            status: 'confirmed',
            msgType: 'booking request',
            confirmedDate: confirmedDate,
            confirmedTime: confirmedTime,
          });
          location.reload();
        });
      } else {
        console.log('please pick a date!!!!');
      };
    });
  });
};

var loadAccount_expert = function() {
  $('#account-content').empty();
  $('.account .view-title').text('MY EXPERT PROFILE');
  $('#account-content').load('/partials/account-expert', function() {

    usersRef.child(currentUserId).once("value", function(snapshot) {
      var user = snapshot.val();
      $('#account--bio').val(user.bio);
      if (user.skills) {
        for (var i=0; i<user.skills.length; i++) {
          var $skill = $('<span>').text(user.skills[i]).addClass('account--skill');
          $('.saved-topics').append($skill);
        };
      } else {
        $('.saved-topics').append('No topics have been added yet.');
      };
    });

    $('#addNewTopic').on('submit', function(e) {
      e.preventDefault();
      var currentURL = window.location.pathname;
      var newTopic = $('#newTopic').val();
      usersRef.child(currentUserId).once("value", function(snapshot) {
        var user = snapshot.val();
        var skills = user.skills;
        skills.push(newTopic);
        console.log(skills);
        usersRef.child(currentUserId).update({
          skills: skills,
        });
      });
      location.reload();
    });

  });
};


$('button.account-view-toggle').on('click', function() {
  var file = $(this).attr('data');
  location.href = "/account?user=" + currentUserId + "&view=" + file;
});
