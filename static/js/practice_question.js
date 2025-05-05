const optionButtons = document.querySelectorAll('.option-btn');

optionButtons.forEach(button => {
    button.addEventListener('click', function () {
        const parent = this.parentElement;
        const allOptions = parent.querySelectorAll('.option-btn');
        const correctAnswer = this.getAttribute('data-correct').trim();

        allOptions.forEach(opt => {
            opt.disabled = true;
            if (opt.textContent.trim() === correctAnswer) {
                opt.classList.add('correct');
            }
        });

        if (this.textContent.trim() !== correctAnswer) {
            this.classList.add('wrong');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.report-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.nextElementSibling;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.report-submit').forEach(button => {
        button.addEventListener('click', () => {
            const questionId = button.getAttribute('data-question-id');
            const reason = button.previousElementSibling.value;

            if (!reason.trim()) return alert("Please enter a reason.");

            fetch('/report-question/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ question_id: questionId, reason })
            }).then(res => {
                if (res.ok) {
                    alert('Report submitted successfully!');
                    button.parentElement.style.display = 'none';
                } else {
                    alert('Failed to report question.');
                }
            });
        });
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
            }
        });
    }
    return cookieValue;
}

