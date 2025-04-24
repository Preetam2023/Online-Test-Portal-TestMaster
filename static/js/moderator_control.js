document.addEventListener('DOMContentLoaded', function() {
    // Handle edit form submission
    const editForms = document.querySelectorAll('.modal-content form');
    
    editForms.forEach(form => {
        form.addEventListener('submit', function(e) {
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
            .then(response => {
                if (response.ok) {
                    // Close the modal
                    const modal = this.closest('.modal');
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    modalInstance.hide();
                    
                    // Show success message
                    const successEvent = new CustomEvent('showToast', {
                        detail: {
                            message: 'Moderator updated successfully!',
                            type: 'success'
                        }
                    });
                    document.dispatchEvent(successEvent);
                    
                    // Reload after 1 second
                    setTimeout(() => location.reload(), 1000);
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                alert('Error updating moderator: ' + error.message);
            });
        });
    });
    
    // Notification bell functionality
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            const container = document.querySelector('.message-container');
            container.classList.toggle('show');
        });
    }
});