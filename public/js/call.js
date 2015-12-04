// Set up the Twilio "Device" (think of it as the browser's phone) with
// our server-generated capability token, which will be inserted by the
// EJS template system:
console.log(token);
Twilio.Device.setup(token);

// Register an event handler to be called when there is an incoming
// call:
Twilio.Device.incoming(function(connection) {
    //For demo purposed, automatically accept the call
    connection.accept();
    console.log('Call in progress...');
});

// Register an event handler for when a call ends for any reason
Twilio.Device.disconnect(function(connection) {
    console.log('Awaiting incoming call...');
});

$('#hangup').click(function() {
    Twilio.Device.disconnectAll();
});

$('#makeCall').on('click', function() {
    Twilio.Device.connect({
        CallerId:   '+13478366248',
        PhoneNumber:'+13477864325'
    });
});
