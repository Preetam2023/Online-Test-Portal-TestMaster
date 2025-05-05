// Timer Constants
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 600; // 10 minutes
const ALERT_THRESHOLD = 300; // 5 minutes
const DANGER_THRESHOLD = 60; // 1 minute

let timer;
let timeLeft = 1200; // 20 minutes in seconds
let testSubmitted = false;
let isDragging = false;
let offsetX, offsetY;

// Make timer draggable
function makeTimerDraggable() {
    const timerElement = document.getElementById('timer');
    
    timerElement.addEventListener('mousedown', (e) => {
        if (e.target.closest('.timer-close')) return;
        
        isDragging = true;
        const rect = timerElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        timerElement.style.cursor = 'grabbing';
        timerElement.style.transition = 'none';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const timerElement = document.getElementById('timer');
        timerElement.style.left = `${e.clientX - offsetX}px`;
        timerElement.style.top = `${e.clientY - offsetY}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            const timerElement = document.getElementById('timer');
            timerElement.style.cursor = 'move';
            timerElement.style.transition = 'all 0.3s ease';
            document.body.style.userSelect = '';
        }
    });
}

function minimizeTimer() {
    const timerElement = document.getElementById('timer');
    // Store current position before minimizing
    const currentLeft = timerElement.style.left;
    const currentTop = timerElement.style.top;
    
    timerElement.classList.toggle('minimized');
    
    // Restore position after toggling
    if (timerElement.classList.contains('minimized')) {
        timerElement.dataset.originalLeft = currentLeft;
        timerElement.dataset.originalTop = currentTop;
    } else {
        timerElement.style.left = timerElement.dataset.originalLeft || 'calc(100% - 180px)';
        timerElement.style.top = timerElement.dataset.originalTop || '20px';
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function setRemainingPathColor(timeLeft) {
    const path = document.getElementById("base-timer-path-remaining");
    
    // Remove all classes first
    path.classList.remove("safe", "warning", "danger");
    
    if (timeLeft <= DANGER_THRESHOLD) {
        path.classList.add("danger");
        // Add blinking animation for last minute
        path.style.animation = "blink 1s infinite alternate";
    } else if (timeLeft <= ALERT_THRESHOLD) {
        path.classList.add("danger");
        path.style.animation = "";
    } else if (timeLeft <= WARNING_THRESHOLD) {
        path.classList.add("warning");
        path.style.animation = "";
    } else {
        path.classList.add("safe");
        path.style.animation = "";
    }
}


function calculateTimeFraction() {
    return timeLeft / 1200;
}

function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
    
}

function updateTimerDisplay() {
    document.getElementById("base-timer-label").textContent = formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
}

function startTimer() {
    // Initialize timer display
    updateTimerDisplay();
    
    // Start the countdown
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitTest(); // Call your test submission function
        }
    }, 1000);
}

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    makeTimerDraggable();
    
    // Set initial position
    const timerElement = document.getElementById('timer');
    timerElement.style.left = 'calc(100% - 180px)';
    timerElement.style.top = '20px';
    
    // Initialize progress text color
    document.getElementById("timer-progress-text").classList.add("safe");
});

// Call this function when starting the test
function startTest() {
    document.getElementById('timer').style.display = 'block';
    timeLeft = 1200; // Reset to 20 minutes
    startTimer();
}

// Show Start button if checkbox is checked
function toggleStartButton() {
    const declarationChecked = document.getElementById('declaration').checked;
    const startBtn = document.getElementById('start-button');
    startBtn.disabled = !declarationChecked;
}

// Start test: show timer and questions
function startTest() {
    document.getElementById('test-form').style.display = 'block';
    document.getElementById('timer').style.display = 'block';
    document.querySelector('.instructions-card').style.display = 'none';
    startTimer();
}
// Submission logic
function submitTest() {
    if (testSubmitted) return;
    testSubmitted = true;
    
    clearInterval(timer);
    
    const questions = document.querySelectorAll('.question-card');
    let correctCount = 0;
    const totalQuestions = questions.length;
    
    questions.forEach((question) => {
        const correctAnswer = question.getAttribute('data-correct').trim();
        const selectedOption = question.querySelector('input[type="radio"]:checked');
        const options = question.querySelectorAll('.option');
        
        // Highlight correct answer
        options.forEach(option => {
            const input = option.querySelector('input');
            if (input.value.trim() === correctAnswer) {
                option.classList.add('correct-answer');
            }
        });
        
        // Highlight incorrect selection if any
        if (selectedOption) {
            const selectedLabel = selectedOption.closest('.option');
            if (selectedOption.value.trim() !== correctAnswer) {
                selectedLabel.classList.add('incorrect-answer');
            } else {
                correctCount++;
            }
        }
    });
    
    // Calculate score and percentage
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Show results
    document.getElementById('test-form').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    
    // Show "See Results" button
    document.querySelector('.see-results-btn').style.display = 'block';
    
    // Animate score display
    animateScore(correctCount, totalQuestions, percentage);
}

function animateScore(correct, total, percentage) {
    // Animate percentage
    const percentageElement = document.getElementById('score-percentage');
    let current = 0;
    const increment = percentage / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= percentage) {
            clearInterval(timer);
            current = percentage;
        }
        percentageElement.textContent = `${Math.round(current)}%`; // ✅ Fixed with backticks
        
        // Update progress ring
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (current / 100) * circumference;
        document.querySelector('.progress-ring-circle').style.strokeDashoffset = offset;
    }, 20);
    
    // Set circle color based on percentage
    const ring = document.querySelector('.progress-ring-circle');
    if (percentage >= 80) {
        ring.style.stroke = '#28a745'; // Green
    } else if (percentage >= 50) {
        ring.style.stroke = '#ffc107'; // Yellow
    } else {
        ring.style.stroke = '#dc3545'; // Red
    }
    
    // Update counts
    document.getElementById('correct-count').textContent = correct;
    document.getElementById('incorrect-count').textContent = total - correct;
    document.getElementById('total-questions').textContent = total;
}

function reviewAnswers() {
    document.getElementById('result').style.display = 'none';
    document.getElementById('test-form').style.display = 'block';
    window.scrollTo(0, 0);
}

function seeResults() {
    document.getElementById('test-form').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    window.scrollTo(0, 0);
}

// Initialize progress ring and timer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress ring
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`; // ✅ Fixed with backticks
        circle.style.strokeDashoffset = circumference;
    }
    
    // Add "See Results" button to test form
    const testControls = document.querySelector('.test-controls');
    if (testControls && !document.querySelector('.see-results-btn')) {
        const seeResultsBtn = document.createElement('button');
        seeResultsBtn.className = 'see-results-btn';
        seeResultsBtn.onclick = seeResults;
        seeResultsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> See Results';
        seeResultsBtn.style.display = 'none'; // Start hidden
        testControls.appendChild(seeResultsBtn);
    }
});