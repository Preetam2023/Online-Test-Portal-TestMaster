// Timer Constants
const FULL_DASH_ARRAY = 283;
const totalTime = (typeof testDurationInMinutes !== 'undefined') ? testDurationInMinutes * 60 : 1200;
let timeLeft = totalTime;
let timer;
let testSubmitted = false;
let isDragging = false;
let offsetX, offsetY;
let autoSaveInterval;
let tabSwitchCount = 0;
let hasWarnedTabSwitch = false;

const testId = window.testId || document.getElementById('testForm')?.dataset.testId;
const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]')?.value;

// DRAGGABLE TIMER
function makeTimerDraggable() {
    const timerElement = document.getElementById('timerContainer');
    if (!timerElement) return;
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
        timerElement.style.left = `${e.clientX - offsetX}px`;
        timerElement.style.top = `${e.clientY - offsetY}px`;
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            timerElement.style.cursor = 'move';
            timerElement.style.transition = 'all 0.3s ease';
            document.body.style.userSelect = '';
        }
    });
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function calculateTimeFraction() {
    return timeLeft / totalTime;
}

function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
}

function setRemainingPathColor(timeLeft) {
    const path = document.getElementById("base-timer-path-remaining");
    path.classList.remove("safe", "warning", "danger");
    const percentLeft = timeLeft / totalTime;
    if (timeLeft <= 120) {
        path.classList.add("danger");
        path.style.animation = "blink 1s infinite alternate";
    } else if (percentLeft <= 0.5) {
        path.classList.add("warning");
        path.style.animation = "";
    } else {
        path.classList.add("safe");
        path.style.animation = "";
    }
}

function updateTimerDisplay() {
    const display = document.getElementById("timerDisplay");
    if (display) display.textContent = formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
}

function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitTest(true); // true = auto submit due to timeout
        }
    }, 1000);
    autoSaveInterval = setInterval(autoSaveProgress, 15000); // every 15 sec
}

// AUTO SAVE
function autoSaveProgress() {
    if (!testId || !csrfToken) return;
    const answers = {};
    document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        answers[input.name] = input.value;
    });

    fetch('/testmaster/save-progress/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            test_id: testId,
            answers: answers,
            time_left: timeLeft,
            tab_switch_count: tabSwitchCount, 
        }),
    }).catch(error => {
        console.error('Auto-save failed:', error);
    });
}

// RESTORE STATE
async function restoreProgress() {
    if (!testId) return;

    try {
        const response = await fetch(`/testmaster/load-progress/${testId}/`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Restore answers
        if (data.answers) {
            for (const [name, value] of Object.entries(data.answers)) {
                const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (input) {
                    input.checked = true;
                    input.dataset.wasChecked = "true";
                }
            }
        }
        
        // Restore timer
        if (data.time_left) {
            timeLeft = parseInt(data.time_left);
            updateTimerDisplay();
        }
        
        // Restore tab switch count
        if (data.tab_switch_count) {
            tabSwitchCount = parseInt(data.tab_switch_count);
            const counterEl = document.getElementById('tabSwitchCount');
            if (counterEl) counterEl.textContent = tabSwitchCount;
        }

        // Show restore notification only if we actually restored something
        if (data.answers || data.time_left || data.tab_switch_count) {
            showRestoreNotification();
        }
    } catch (error) {
        console.error('Restore failed:', error);
    }
}

function showRestoreNotification() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Session Restored',
            text: 'Your test session was automatically restored from the last saved state.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
        });
    } else {
        alert("Your session was restored from saved progress.");
    }
}

// TOGGLE START BUTTON
function toggleStartButton() {
    const checkbox = document.getElementById('startTestCheckbox');
    const btn = document.getElementById('startTestBtn');
    if (btn) {
        btn.disabled = !checkbox.checked;
        btn.classList.toggle('enabled', checkbox.checked);
        btn.classList.toggle('disabled', !checkbox.checked);
    }
}

async function startTest() {
    const form = document.getElementById('testForm');
    const timerContainer = document.getElementById('timerContainer');
    const instructions = document.querySelector('.instructions-card');

    if (form && timerContainer) {
        form.classList.add('visible');
        timerContainer.style.display = 'block';
        if (instructions) instructions.style.display = 'none';
        
        // First restore progress, then start timer
        await restoreProgress();
        startTimer();
    }
}

function submitTest(auto = false) {
    if (testSubmitted) return;
    testSubmitted = true;
    clearInterval(timer);
    clearInterval(autoSaveInterval);

    const testForm = document.getElementById('testForm');
    
    // Collect current answers
    const getCurrentAnswers = () => {
        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            answers[input.name] = input.value;
        });
        return answers;
    };

    // Save progress before final submit
    fetch('/testmaster/save-progress/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            test_id: testId,
            answers: getCurrentAnswers(),
            time_left: timeLeft,
            tab_switch_count: tabSwitchCount, 
        }),
    }).catch(err => console.error("Final save before submit failed:", err));

    // Build form data
    const formData = new FormData(testForm);
    if (!formData.has('test_id') && testId) {
        formData.append('test_id', testId);
    }

    // Submit to backend
    fetch(testForm.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            console.error(auto ? "Auto submission failed." : "Manual submission failed.");
        }

        testForm.querySelectorAll('input, button').forEach(el => {
            el.disabled = true;
        });
    })
    .catch(error => console.error(auto ? "Auto submit error:" : "Manual submit error:", error));

    // Manual-only UI logic (result preview, animation)
    if (!auto) {
        const questions = document.querySelectorAll('.question-card');
        let correctCount = 0;
        const totalQuestions = questions.length;

        questions.forEach(question => {
            const correctAnswer = question.getAttribute('data-correct')?.trim();
            const selectedOption = question.querySelector('input[type="radio"]:checked');
            const options = question.querySelectorAll('.option');

            options.forEach(option => {
                const input = option.querySelector('input');
                if (input && input.value.trim() === correctAnswer) {
                    option.classList.add('correct-answer');
                }
            });

            if (selectedOption) {
                const selectedLabel = selectedOption.closest('.option');
                if (selectedOption.value.trim() !== correctAnswer) {
                    selectedLabel.classList.add('incorrect-answer');
                } else {
                    correctCount++;
                }
            }
        });

        const percentage = Math.round((correctCount / totalQuestions) * 100);
        const resultSection = document.getElementById('result');
        if (testForm && resultSection) {
            testForm.style.display = 'none';
            resultSection.style.display = 'block';
        }

        const seeResultsBtn = document.querySelector('.see-results-btn');
        if (seeResultsBtn) seeResultsBtn.style.display = 'block';

        animateScore(correctCount, totalQuestions, percentage);
    }

    // Block back navigation post-submit
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
        alert("You have already submitted the test. Back navigation is disabled.");
        window.history.pushState(null, "", window.location.href);
    };
}

// ANIMATE SCORE
function animateScore(correct, total, percentage) {
    const percentageElement = document.getElementById('score-percentage');
    let current = 0;
    const increment = percentage / 50;
    const ring = document.querySelector('.progress-ring-circle');

    const timer = setInterval(() => {
        current += increment;
        if (current >= percentage) {
            clearInterval(timer);
            current = percentage;
        }
        percentageElement.textContent = `${Math.round(current)}%`;
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (current / 100) * circumference;
        ring.style.strokeDashoffset = offset;
    }, 20);

    if (percentage >= 80) ring.style.stroke = '#28a745';
    else if (percentage >= 50) ring.style.stroke = '#ffc107';
    else ring.style.stroke = '#dc3545';

    document.getElementById('correct-count').textContent = correct;
    document.getElementById('incorrect-count').textContent = total - correct;
    document.getElementById('total-questions').textContent = total;
}

function seeResults() {
    const form = document.getElementById('testForm');
    const result = document.getElementById('result');
    if (form && result) {
        form.style.display = 'none';
        result.style.display = 'block';
        window.scrollTo(0, 0);
    }
}



// Store beforeunload handler reference for removal
const beforeUnloadHandler = function(e) {
    if (!testSubmitted) {
        // Save progress synchronously if possible
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/testmaster/save-progress/', false); // Synchronous!
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-CSRFToken', csrfToken);
        xhr.send(JSON.stringify({
            test_id: testId,
            answers: getCurrentAnswers(),
            time_left: timeLeft,
            tab_switch_count: tabSwitchCount,
        }));
        
        // Set flag for next load
        sessionStorage.setItem('was_refreshed', 'true');
        sessionStorage.setItem('last_save_time', Date.now().toString());
        
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
};

// MODIFIED VISIBILITY CHANGE HANDLER
document.addEventListener('visibilitychange', function() {
    if (document.hidden && !testSubmitted) {
        tabSwitchCount++;
        
        // Update UI immediately
        const counterEl = document.getElementById('tabSwitchCount');
        if (counterEl) counterEl.textContent = tabSwitchCount;
        
        // Auto-save the new count
        autoSaveProgress();
        
        // Show warning
        showTabSwitchWarning();
    }
});

function showTabSwitchWarning() {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: 'warning',
            title: 'Tab Switching Detected!',
            text: `Tab switches: ${tabSwitchCount}. Switching tabs is strictly not allowed during test. You may be disqualified.`,
            confirmButtonText: 'Okay, I understand',
            allowOutsideClick: false,
            allowEscapeKey: false,
        });
    } else {
        alert(`Tab switches: ${tabSwitchCount}. Switching tabs is strictly not allowed during test. You may be disqualified.`);
    }
}

// ON LOAD
document.addEventListener('DOMContentLoaded', () => {
    makeTimerDraggable();
    toggleStartButton();

    const timerElement = document.getElementById('timerContainer');
    if (timerElement) {
        timerElement.style.left = 'calc(100% - 180px)';
        timerElement.style.top = '20px';
    }

    document.getElementById('startTestCheckbox')?.addEventListener('change', toggleStartButton);
    document.getElementById('startTestBtn')?.addEventListener('click', startTest);

    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
    }

    const testControls = document.querySelector('.test-controls');
    if (testControls && !document.querySelector('.see-results-btn')) {
        const seeResultsBtn = document.createElement('button');
        seeResultsBtn.className = 'see-results-btn';
        seeResultsBtn.onclick = seeResults;
        seeResultsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> See Results';
        seeResultsBtn.style.display = 'none';
        testControls.appendChild(seeResultsBtn);
    }

    document.querySelectorAll('.option input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', function () {
            if (this.dataset.wasChecked === "true") {
                this.checked = false;
                this.dataset.wasChecked = "false";
            } else {
                document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => r.dataset.wasChecked = "false");
                this.dataset.wasChecked = "true";
            }
        });
        radio.addEventListener('change', () => {
            autoSaveProgress(); // Save immediately on change
        });
    });

    document.addEventListener('keydown', function (e) {
        // Block Ctrl+C, Ctrl+X, Ctrl+U, Ctrl+S, Ctrl+P, F12
        if ((e.ctrlKey && ['c', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())) || e.key === 'F12') {
            e.preventDefault();
            alert("Cheating prevention: Action blocked");
        }
    });

    // Block right-click context menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Set up refresh confirmation
    window.addEventListener('beforeunload', beforeUnloadHandler);
    
    // Add custom refresh handler for browsers that support it
    window.addEventListener('unload', function() {
        if (!testSubmitted) {
            sessionStorage.setItem('was_refreshed', 'true');
        }
    });
});

document.getElementById('submitTestBtn')?.addEventListener('click', () => {
    if (testSubmitted) return;

    Swal.fire({
        title: 'Submit Test?',
        text: 'Are you sure you want to submit the test now?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit it!',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            submitTest(false);  // Manual submission
        }
    });
});

// Function to get current answers
function getCurrentAnswers() {
    const answers = {};
    document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        answers[input.name] = input.value;
    });
    return answers;
}

// NEW: REFRESH CONFIRMATION FUNCTION
// Remove any existing beforeunload handlers
window.removeEventListener('beforeunload', beforeUnloadHandler);

// NEW REFRESH HANDLER
function handleRefreshConfirmation(e) {
    if (testSubmitted) return; // No warning if test is already submitted
    
    // Prevent default browser popup
    e.preventDefault();
    e.returnValue = '';
    
    // Show our custom popup instead
    Swal.fire({
        title: 'Are you sure?',
        html: '<strong>Are you sure you want to refresh or leave the test?</strong><br>Your progress may be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then((result) => {
        if (result.isConfirmed) {
            // User confirmed - proceed with refresh/leave
            // Save progress before leaving
            sessionStorage.setItem('was_refreshed', 'true');
            
            // For refresh, we need to do a synchronous save
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/testmaster/save-progress/', false); // Synchronous!
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-CSRFToken', csrfToken);
            xhr.send(JSON.stringify({
                test_id: testId,
                answers: getCurrentAnswers(),
                time_left: timeLeft,
                tab_switch_count: tabSwitchCount,
            }));
            
            // Remove the handler to prevent infinite loop
            window.removeEventListener('beforeunload', handleRefreshConfirmation);
            
            // If this was a refresh, do it now
            if (e.type === 'beforeunload') {
                window.location.reload();
            }
        }
    });
    
    // Return the confirmation message (though most modern browsers ignore it)
    return '';
}

// Add the single handler
window.addEventListener('beforeunload', handleRefreshConfirmation);