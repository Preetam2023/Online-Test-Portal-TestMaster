
document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // File upload preview
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const uploadArea = this.closest('.upload-area');
            if (this.files && this.files[0]) {
                uploadArea.querySelector('span').textContent = this.files[0].name;
                uploadArea.style.borderColor = '#3b82f6';
            }
        });
    }

    // Form validation
    const form = document.querySelector('.registration-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const password1 = document.querySelector('#id_password1');
            const password2 = document.querySelector('#id_password2');
            
            if (password1 && password2 && password1.value !== password2.value) {
                e.preventDefault();
                alert('Passwords do not match!');
                password2.focus();
            }
        });
    }
});
