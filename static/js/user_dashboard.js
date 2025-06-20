document.addEventListener('DOMContentLoaded', function () {
     const orgBtn = document.getElementById('orgBtn');
    const orgForm = document.getElementById('orgForm');

    if (orgBtn && orgForm) {
        // Always hide the form by default
        orgForm.classList.remove('show');

        // Show the form only if orgName is provided
        const orgName = "{{ organization_name|default:'' }}";
        if (orgName.trim() !== "") {
            orgForm.classList.add('show');
        }

        // Toggle visibility on button click
        orgBtn.addEventListener('click', function (e) {
            e.preventDefault();
            orgForm.classList.toggle('show');
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

document.addEventListener('DOMContentLoaded', () => {
    const alerts = document.querySelectorAll('.alert-box');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.remove();
        }, 5000); // Auto-dismiss after 5 seconds
    });
});





