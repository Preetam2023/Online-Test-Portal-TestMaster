let timer;
let timeLeft = 1200; // 20 minutes in seconds

// Show Start button if checkbox is checked
function toggleStartButton() {
    const declarationChecked = document.getElementById('declaration').checked;
    const startBtn = document.getElementById('start-button');
    startBtn.style.display = declarationChecked ? 'block' : 'none';
}

// Start test: show timer and questions
function startTest() {
    document.getElementById('test-form').style.display = 'block';
    document.getElementById('timer').style.display = 'block';
    document.getElementById('start-button').style.display = 'none';
    startTimer();
}

// Countdown timer logic
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('time').innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitTest();
        }
    }, 1000);
}

// Submission logic
function submitTest() {
    clearInterval(timer);

    const questions = document.querySelectorAll('.question-block');
    let score = 0;

    questions.forEach((question) => {
        const correctAnswer = question.getAttribute('data-correct').trim();
        const selected = question.querySelector('input[type="radio"]:checked');
        const options = question.querySelectorAll('input[type="radio"]');

        options.forEach(opt => {
            const parentLabel = opt.parentElement;

            if (opt.value.trim() === correctAnswer) {
                parentLabel.style.backgroundColor = '#d4edda'; // green
                parentLabel.style.border = '1px solid green';
            }

            if (selected && opt === selected && opt.value.trim() !== correctAnswer) {
                parentLabel.style.backgroundColor = '#f8d7da'; // red
                parentLabel.style.border = '1px solid red';
            }
        });

        if (selected && selected.value.trim() === correctAnswer) {
            score++;
        }
    });

    const total = questions.length;
    const percentage = ((score / total) * 100).toFixed(2);

    const result = document.getElementById('result');
    result.style.display = 'block';
    result.innerHTML = `<strong>You scored ${score} out of ${total} (${percentage}%).</strong>`;

    document.getElementById('submit-button').disabled = true;
    document.getElementById('submit-button').style.backgroundColor = '#ccc';
    document.getElementById('more-tests').style.display = 'block';
}

