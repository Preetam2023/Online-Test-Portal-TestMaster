// Toggle Sidebar
document.getElementById('toggleSidebar').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Mobile menu toggle
const menuToggle = document.createElement('div');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.body.appendChild(menuToggle);

menuToggle.addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

// Active menu item
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});