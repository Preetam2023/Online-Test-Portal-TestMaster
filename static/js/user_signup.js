$(document).ready(function() {
    // Password visibility toggle
    $('.toggle-password').click(function() {
        const target = $(this).data('target');
        const input = $('#' + target);
        const icon = $(this).find('i');

        if (input.attr('type') === 'password') {
            input.attr('type', 'text');        // Show password
            icon.removeClass('fa-eye-slash').addClass('fa-eye'); // Change to 'show' icon

        } else {
            input.attr('type', 'password');     // Hide password
            icon.removeClass('fa-eye').addClass('fa-eye-slash'); // Change to 'hide' icon

        }
    });

    // Enable/disable signup button
    $('#terms').change(function() {
        $('#signupBtn').prop('disabled', !this.checked);
    });

    // Form validation
    $('#signupForm').submit(function(e) {
        const password = $('#id_password1').val();

        if (password.length < 8) {
            e.preventDefault();
            alert('Password must be at least 8 characters long!');
            return false;
        }

        if (!$('#terms').is(':checked')) {
            e.preventDefault();
            alert('You must agree to the Terms and Privacy Policy!');
            return false;
        }

        return true;
    });

    // Prevent modal links from causing page reload
    $('[data-target="#termsModal"], [data-target="#privacyModal"]').click(function(e) {
        e.preventDefault();
    });
});



