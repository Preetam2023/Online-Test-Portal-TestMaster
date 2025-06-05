

// Initialize particles.js
document.addEventListener('DOMContentLoaded', function() {
    // Particles.js configuration
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }

    // Inspirational quotes
    const quotes = [
        {
            text: "Success is the sum of small efforts, repeated day in and day out.",
            author: "Robert Collier"
        },
        {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        },
        {
            text: "Don't watch the clock; do what it does. Keep going.",
            author: "Sam Levenson"
        },
        {
            text: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt"
        },
        {
            text: "The expert in anything was once a beginner.",
            author: "Helen Hayes"
        }
    ];

    const quoteElement = document.getElementById('quote-text');
    const authorElement = document.getElementById('quote-author');

    if (quoteElement && authorElement) {
        // Display a random quote on page load
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = randomQuote.text;
        authorElement.textContent = `- ${randomQuote.author}`;

        // Change quote every 10 seconds
        setInterval(() => {
            const newRandomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteElement.style.opacity = 0;
            authorElement.style.opacity = 0;

            setTimeout(() => {
                quoteElement.textContent = newRandomQuote.text;
                authorElement.textContent = `- ${newRandomQuote.author}`;
                quoteElement.style.opacity = 1;
                authorElement.style.opacity = 1;
            }, 500);
        }, 10000);
    }

    // Add animation to table rows
    const tableRows = document.querySelectorAll('.test-row');
    tableRows.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effect to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.stat-icon');
            icon.style.transform = 'scale(1.1)';
            icon.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.stat-icon');
            icon.style.transform = 'scale(1)';
        });
    });
});
