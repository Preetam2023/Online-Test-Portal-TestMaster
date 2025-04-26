document.addEventListener('DOMContentLoaded', function() {
    // Notification System
    const notificationBell = document.querySelector('.notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationBell && notificationDropdown) {
        // Toggle dropdown visibility
        notificationBell.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });
        
        // Close notifications
        document.querySelectorAll('.notification-close').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                this.closest('.notification-item').style.display = 'none';
                updateNotificationCount();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
        
        function updateNotificationCount() {
            const visibleNotifications = document.querySelectorAll('.notification-item:not([style*="display: none"])').length;
            const notificationBadge = document.querySelector('.notification-badge');
            
            if (notificationBadge) {
                notificationBadge.textContent = visibleNotifications;
                notificationBadge.style.display = visibleNotifications > 0 ? 'flex' : 'none';
            }
        }
        
        // Initialize count
        updateNotificationCount();
    }
    
    // Toggle moderator status
    document.querySelectorAll('.status-toggle input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const moderatorId = this.dataset.modId;
            const isActive = this.checked;
            const statusText = this.nextElementSibling.nextElementSibling;
            
            fetch(`/accounts/organization/moderators/toggle-status/${moderatorId}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    statusText.textContent = isActive ? 'Active' : 'Inactive';
                    // Optional: Show a small toast notification
                    showToast(data.message, 'success');
                } else {
                    // Revert the toggle if failed
                    this.checked = !isActive;
                    showToast(data.error || 'Error updating status', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.checked = !isActive;
                showToast('Network error occurred', 'error');
            });
        });
    });
    
    // Helper function to show toast notifications
    function showToast(message, type) {
        // Simple implementation - you can replace with a proper toast library
        alert(`${type.toUpperCase()}: ${message}`);
    }
});