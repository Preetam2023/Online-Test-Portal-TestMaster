document.addEventListener('DOMContentLoaded', function() {
    // Organization Test Toggle
    const orgBtn = document.getElementById('orgBtn');
    const orgForm = document.getElementById('orgForm');
    
    if (orgBtn && orgForm) {
        orgBtn.addEventListener('click', function(e) {
            e.preventDefault();
            orgForm.style.display = orgForm.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Time-based Greeting
    const welcomeHeading = document.querySelector('.header-title h2');
    if (welcomeHeading) {
        const hour = new Date().getHours();
        const nameSpan = welcomeHeading.querySelector('span');
        const name = nameSpan ? nameSpan.textContent : 'User';
        
        let greeting;
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        
        welcomeHeading.innerHTML = `${greeting}, <span>${name}</span>`;
    }

    // Card Hover Effects
    const cards = document.querySelectorAll('.access-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow)';
        });
    });

    // Click functionality for cards
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const link = this.getAttribute('onclick');
            if (link) {
                const urlMatch = link.match(/window\.location\.href='([^']+)'/);
                if (urlMatch && urlMatch[1]) {
                    window.location.href = urlMatch[1];
                }
            }
        });
    });
});