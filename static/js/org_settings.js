document.addEventListener('DOMContentLoaded', function() {
    // Logo Preview
    const logoInput = document.getElementById('logoInput');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showToast('File size exceeds 2MB limit', 'error');
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
                showToast("Organization deletion requested.", 'warning');
            }
        });
    }

 // Password Change Modal
const changePasswordBtn = document.getElementById('changePasswordBtn');
const passwordModal = document.getElementById('passwordModal');
const modalDialog = document.querySelector('.modal-dialog');
const closePasswordModal = document.getElementById('closePasswordModal');
const cancelPasswordChange = document.getElementById('cancelPasswordChange');

// Toggle modal
function toggleModal(show) {
    if (show) {
        passwordModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on first input when modal opens
        setTimeout(() => {
            document.getElementById('currentPassword').focus();
        }, 100);
    } else {
        passwordModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

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

// Close modal when clicking outside (but not inside the dialog)
passwordModal.addEventListener('click', function(e) {
    if (e.target === passwordModal) {
        toggleModal(false);
    }
});

// Prevent clicks inside the dialog from closing the modal
if (modalDialog) {
    modalDialog.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && passwordModal.classList.contains('active')) {
        toggleModal(false);
    }
});

    // Enhanced password form submission with validation
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Disable submit button during request
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            
            const formData = new FormData(this);
            const url = this.getAttribute('action');
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            
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
                    showToast('Password changed successfully!');
                    passwordForm.reset();
                } else {
                    // Handle form errors
                    if (data.error) {
                        try {
                            const errors = JSON.parse(data.error);
                            Object.keys(errors).forEach(field => {
                                const input = document.getElementById(field === 'old_password' ? 'currentPassword' : 
                                                                   field === 'new_password1' ? 'newPassword' : 
                                                                   'confirmPassword');
                                if (input) {
                                    input.classList.add('input-error');
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'error-message';
                                    errorDiv.textContent = errors[field][0].message;
                                    input.parentNode.insertBefore(errorDiv, input.nextSibling);
                                }
                            });
                            showToast('Please fix the errors in the form', 'error');
                        } catch (e) {
                            showToast(data.error || 'Error changing password', 'error');
                        }
                    } else {
                        showToast('Error changing password', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred while changing password', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Update Password';
            });
        });
    }
});