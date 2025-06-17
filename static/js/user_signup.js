$(document).ready(function() {
    
    // Password visibility toggle
    $('.toggle-password').click(function() {
        const target = $(this).data('target');
        const input = $('#' + target);
        const icon = $(this).find('i');

        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Enable/disable signup button
    $('#terms').change(function() {
        $('#signupBtn').prop('disabled', !this.checked);
    });

    // Form validation - unified handler
    $('#signupForm').on('submit', function(e) {
        // First, clear any existing errors
        $('.error-message').hide();
        $('.form-control').removeClass('is-invalid');
        
        // Client-side validation
        let isValid = validateForm();
        
        // If client-side validation fails, prevent form submission
        if (!isValid) {
            e.preventDefault();
            return false;
        }
        
        // If client-side validation passes, allow form submission
        // Backend errors will be handled by the server response
        return true;
    });

    // Real-time validation for fields
    $('input').on('blur', function() {
        const id = $(this).attr('id');
        
        if (id === 'first_name') {
            validateFirstName();
        } else if (id === 'last_name') {
            validateLastName();
        } else if (id === 'id_email') {
            validateEmail();
        } else if (id === 'id_password') {
            validatePassword();
        }
    });

    // Prevent modal links from causing page reload
    $('[data-target="#termsModal"], [data-target="#privacyModal"]').click(function(e) {
        e.preventDefault();
    });

    // Main validation function
    function validateForm() {
        let isValid = true;
        
        // Validate first name
        const firstName = $('#first_name').val().trim();
        if (!firstName) {
            showError('first_name_error', 'Please enter your first name');
            isValid = false;
        }
        
        // Validate last name
        const lastName = $('#last_name').val().trim();
        if (!lastName) {
            showError('last_name_error', 'Please enter your last name');
            isValid = false;
        }
        
        // Validate email
        const email = $('#id_email').val().trim();
        if (!email) {
            showError('email_error', 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email_error', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        const password = $('#id_password').val();
        if (!password) {
            showError('password_error', 'Please create a password');
            isValid = false;
        } else if (password.length < 8) {
            showError('password_error', 'Password must be at least 8 characters');
            isValid = false;
        } else if (!/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
            showError('password_error', 'Include a number and special character');
            isValid = false;
        }
        
        // Validate terms checkbox
        if (!$('#terms').is(':checked')) {
            showError('terms_error', 'You must accept the terms and conditions');
            isValid = false;
        }
        
        return isValid;
    }

    // Individual validation functions
    function validateFirstName() {
        const val = $('#first_name').val().trim();
        if (!val) {
            showError('first_name_error', 'Please enter your first name');
        } else {
            hideError('first_name_error');
        }
    }
    
    function validateLastName() {
        const val = $('#last_name').val().trim();
        if (!val) {
            showError('last_name_error', 'Please enter your last name');
        } else {
            hideError('last_name_error');
        }
    }
    
    function validateEmail() {
        const val = $('#id_email').val().trim();
        if (!val) {
            showError('email_error', 'Please enter your email address');
        } else if (!isValidEmail(val)) {
            showError('email_error', 'Please enter a valid email address');
        } else {
            hideError('email_error');
        }
    }
    
    function validatePassword() {
        const val = $('#id_password').val();
        if (!val) {
            showError('password_error', 'Please create a password');
        } else if (val.length < 8) {
            showError('password_error', 'Password must be at least 8 characters');
        } else if (!/[0-9]/.test(val) || !/[!@#$%^&*]/.test(val)) {
            showError('password_error', 'Include a number and special character');
        } else {
            hideError('password_error');
        }
    }
    
    // Helper functions
    function showError(elementId, message) {
        $('#' + elementId).text(message).show();
        $('#' + elementId.replace('_error', '')).addClass('is-invalid');
    }
    
    function hideError(elementId) {
        $('#' + elementId).hide();
        $('#' + elementId.replace('_error', '')).removeClass('is-invalid');
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});