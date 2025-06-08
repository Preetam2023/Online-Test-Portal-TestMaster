// shared_base.js
document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar collapse - works for both roles
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('collapsed');
        });
    }
    
    // Mobile menu toggle
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 992) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnMenuToggle = event.target === menuToggle || menuToggle.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnMenuToggle) {
                sidebar.classList.remove('show');
            }
        }
    });
});