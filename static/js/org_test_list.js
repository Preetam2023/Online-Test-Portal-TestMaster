document.addEventListener('DOMContentLoaded', function() {
    // Close message alerts
    const closeButtons = document.querySelectorAll('.close-btn');
    const searchInput = document.getElementById('test-search');
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
    document.querySelectorAll('.test-code-error').forEach(errorBox => {
    const inputGroup = errorBox.closest('.test-access-form').querySelector('.input-group input');
    if (inputGroup) {
        inputGroup.classList.add('shake-animation');
        setTimeout(() => inputGroup.classList.remove('shake-animation'), 600);
    }
});
const scrollTarget = document.querySelector('#scroll-target');
if (scrollTarget) {
    const targetId = scrollTarget.getAttribute('data-scroll-to');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300); // Delay ensures layout is ready
    }
}



searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    if (!query) {
        testCards.forEach(card => card.style.display = 'block');
        return;
    }

    const exactMatches = [];
    const partialMatches = [];

    testCards.forEach(card => {
        const title = card.getAttribute('data-title');

        if (title.includes(query)) {
            if (title.startsWith(query)) {
                exactMatches.push(card);
            } else {
                partialMatches.push(card);
            }
        } else {
            card.style.display = 'none';
        }
    });

    // Hide all cards first
    testCards.forEach(card => card.style.display = 'none');

    // Show matches in order
    [...exactMatches, ...partialMatches].forEach(card => {
        card.style.display = 'block';
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

