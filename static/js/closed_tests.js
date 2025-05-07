document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('.action-buttons button');
    
    tooltipElements.forEach(el => {
        const tooltipText = el.getAttribute('title');
        if (tooltipText) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            el.appendChild(tooltip);
            
            el.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });
            
            el.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });
        }
    });
    
    // Modal functionality
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    const closeModal = document.querySelector('.close-modal');
    
    let currentAction = null;
    let currentTestId = null;
    
    // Restore button click
    document.querySelectorAll('.btn-restore').forEach(btn => {
        btn.addEventListener('click', function() {
            currentTestId = this.getAttribute('data-test-id');
            currentAction = 'restore';
            modalTitle.textContent = 'Restore Test';
            modalMessage.textContent = 'Are you sure you want to restore this test? It will be available in the active tests list.';
            modal.style.display = 'block';
        });
    });
    
    // Permanent delete button click
    document.querySelectorAll('.btn-permanent-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            currentTestId = this.getAttribute('data-test-id');
            currentAction = 'delete';
            modalTitle.textContent = 'Permanently Delete Test';
            modalMessage.textContent = 'This action cannot be undone. All test data will be permanently deleted. Are you sure?';
            modal.style.display = 'block';
        });
    });
    
    // Details button click
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const testId = this.getAttribute('data-test-id');
            // Implement details view functionality
            window.location.href = `/test/${testId}/details/`;
        });
    });
    
    // Export button click
    document.getElementById('export-btn').addEventListener('click', function() {
        // Implement export functionality
        alert('Export to CSV functionality will be added soon');
    });
    
    // Modal close handlers
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modalCancel.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modalConfirm.addEventListener('click', function() {
        modal.style.display = 'none';
        
        if (currentAction && currentTestId) {
            if (currentAction === 'restore') {
                // Implement restore API call
                alert(`Restoring test with ID: ${currentTestId}`);
                // fetch(`/api/tests/${currentTestId}/restore/`, { method: 'POST' })
                //     .then(response => response.json())
                //     .then(data => {
                //         if (data.success) {
                //             location.reload();
                //         }
                //     });
            } else if (currentAction === 'delete') {
                // Implement delete API call
                alert(`Permanently deleting test with ID: ${currentTestId}`);
                // fetch(`/api/tests/${currentTestId}/delete/`, { method: 'DELETE' })
                //     .then(response => response.json())
                //     .then(data => {
                //         if (data.success) {
                //             location.reload();
                //         }
                //     });
            }
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Add animation to table rows when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.closed-test-row').forEach(row => {
        observer.observe(row);
    });
});