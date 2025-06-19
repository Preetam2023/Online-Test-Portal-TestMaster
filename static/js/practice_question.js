document.addEventListener('DOMContentLoaded', () => {
    // Toggle Report Form
    document.querySelectorAll('.report-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.nextElementSibling;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
    });

    // Submit Report
    document.querySelectorAll('.report-submit').forEach(button => {
        button.addEventListener('click', () => {
            const questionId = button.getAttribute('data-question-id');
            const reasonTextarea = button.previousElementSibling;
            const reason = reasonTextarea.value;
            const reportUrl = button.getAttribute('data-url');

            if (!reason.trim()) {
                alert("Please enter a reason.");
                return;
            }

            fetch(reportUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ question_id: questionId, reason })
            })
            .then(response => {
                if (!response.ok) throw new Error("Network error");
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    reasonTextarea.value = '';

                    const msg = document.createElement('div');
                    msg.className = 'report-success-msg';
                    msg.innerHTML = '<i class="fas fa-check-circle"></i> Report submitted successfully!';
                    button.parentElement.appendChild(msg);

                    // Disable form temporarily
                    button.disabled = true;
                    reasonTextarea.disabled = true;

                    setTimeout(() => {
                        msg.remove();
                        button.parentElement.style.display = 'none';
                        button.disabled = false;
                        reasonTextarea.disabled = false;
                    }, 2500);
                } else {
                    alert('Failed to report question: ' + (data.error || 'Unknown error.'));
                }
            })
            .catch(error => {
                console.error('Report Error:', error);
                alert('Something went wrong. Please try again.');
            });
        });
    });

    // Handle Option Selection
    document.querySelectorAll('.options').forEach(optionGroup => {
        const buttons = optionGroup.querySelectorAll('.option-btn');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (optionGroup.classList.contains('answered')) return;

                const correctOption = button.getAttribute('data-correct').trim();
                const selectedOption = button.textContent.trim();

                buttons.forEach(btn => {
                    const btnText = btn.textContent.trim();

                    // Highlight correct answer
                    if (btnText === correctOption) {
                        btn.classList.add('correct');
                    }

                    // If selected wrong option
                    if (btn === button && btnText !== correctOption) {
                        btn.classList.add('wrong');
                    }

                    btn.disabled = true;
                });

                optionGroup.classList.add('answered');
            });
        });
    });
});

// CSRF helper
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
