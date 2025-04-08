document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordField = document.getElementById('id_password1');
    
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
        });
    }

    // Password strength indicator
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            const strengthMeter = document.querySelector('.strength-meter');
            const strengthBars = document.querySelectorAll('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            
            if (this.value.length === 0) {
                strengthBars.forEach(bar => bar.className = 'strength-bar');
                strengthText.textContent = 'Password strength';
                return;
            }
            
            // Reset classes
            strengthBars.forEach(bar => bar.className = 'strength-bar');
            
            // Check strength
            let strength = 0;
            
            // Length check
            if (this.value.length >= 8) strength++;
            if (this.value.length >= 12) strength++;
            
            // Complexity checks
            if (/[A-Z]/.test(this.value)) strength++;
            if (/[0-9]/.test(this.value)) strength++;
            if (/[^A-Za-z0-9]/.test(this.value)) strength++;
            
            // Update UI
            if (strength <= 2) {
                strengthBars[0].classList.add('weak');
                strengthText.textContent = 'Weak password';
            } else if (strength <= 4) {
                strengthBars[0].classList.add('medium');
                strengthBars[1].classList.add('medium');
                strengthText.textContent = 'Medium strength';
            } else {
                strengthBars[0].classList.add('strong');
                strengthBars[1].classList.add('strong');
                strengthBars[2].classList.add('strong');
                strengthText.textContent = 'Strong password';
            }
        });
    }

    // Form validation
    const form = document.querySelector('.student-signup-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            const password1 = document.getElementById('id_password1');
            const password2 = document.getElementById('id_password2');
            const terms = document.getElementById('terms');
            
            // Password match validation
            if (password1 && password2 && password1.value !== password2.value) {
                e.preventDefault();
                alert('Passwords do not match!');
                password2.focus();
                return false;
            }
            
            // Password strength validation
            if (password1 && password1.value.length < 8) {
                e.preventDefault();
                alert('Password must be at least 8 characters long');
                password1.focus();
                return false;
            }
            
            // Terms agreement validation
            if (terms && !terms.checked) {
                e.preventDefault();
                alert('You must agree to the terms and conditions');
                return false;
            }
            
            return true;
        });
    }
});