document.addEventListener('DOMContentLoaded', function() {
    // Logo Preview
    const logoInput = document.getElementById('logoInput');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size exceeds 2MB limit');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewDiv = document.querySelector('.logo-preview-container');
                    let preview = document.getElementById('logoPreview');
                    
                    if (!preview) {
                        previewDiv.innerHTML = '';
                        preview = document.createElement('img');
                        preview.id = 'logoPreview';
                        preview.className = 'logo-preview';
                        previewDiv.appendChild(preview);
                    }
                    preview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Delete Organization Confirmation
    const deleteBtn = document.getElementById('deleteOrgBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const confirmed = confirm('WARNING: This will permanently delete your organization and all associated data. This action cannot be undone.\n\nAre you sure you want to proceed?');
            if (confirmed) {
                // Add deletion logic or redirection here
                alert("Organization deletion requested.");
            }
        });
    }

    // Password Change Modal
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    const toast = document.getElementById('toast');

    // Toggle modal
    function toggleModal(show) {
        if (show) {
            passwordModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            passwordModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Show toast
    function showToast() {
        toast.classList.add('show');
        
        setTimeout(function() {
            toast.classList.remove('show');
        }, 5000);
    }

    // Close toast
    const toastClose = document.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            toast.classList.remove('show');
        });
    }

    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Modal event listeners
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            toggleModal(true);
        });
    }

    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', function() {
            toggleModal(false);
        });
    }

    if (cancelPasswordChange) {
        cancelPasswordChange.addEventListener('click', function() {
            toggleModal(false);
        });
    }

    // Close modal when clicking outside
    passwordModal.addEventListener('click', function(e) {
        if (e.target === passwordModal) {
            toggleModal(false);
        }
    });

    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const url = this.getAttribute('action');
            
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toggleModal(false);
                    showToast();
                    passwordForm.reset();
                } else {
                    // Handle errors
                    alert(data.error || 'Error changing password');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while changing password');
            });
        });
    }
});