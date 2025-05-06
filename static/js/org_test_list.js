document.addEventListener('DOMContentLoaded', function() {
    // Close message alerts
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                this.parentElement.remove();
            }, 500);
        });
    });

    // Add animation to cards on scroll
    const testCards = document.querySelectorAll('.test-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `cardAppear 0.6s ease-out forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    testCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Add hover effect to form inputs
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        const icon = input.previousElementSibling;
        
        input.addEventListener('focus', () => {
            icon.style.color = getComputedStyle(input).borderColor;
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                icon.style.color = '#6c757d';
            }
        });
    });
});

// Add custom animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes cardAppear {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

