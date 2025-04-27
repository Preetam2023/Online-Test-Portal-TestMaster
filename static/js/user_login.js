document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    
    togglePassword.addEventListener('click', function() {
        // Toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
        // Toggle the eye icon
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
});



