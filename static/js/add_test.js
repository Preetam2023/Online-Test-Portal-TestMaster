// add_test.js (updated for Bootstrap 5 modal API)

document.addEventListener('DOMContentLoaded', function () {
    const testQuestionsDiv = document.getElementById("testQuestions");

    const questionSourceModalEl = document.getElementById('questionSourceModal');
    const questionBankModalEl = document.getElementById('questionBankModal');
    const questionSourceModal = new bootstrap.Modal(questionSourceModalEl);
    const questionBankModal = new bootstrap.Modal(questionBankModalEl);

    document.getElementById("addQuestionBtn").onclick = () => {
        questionSourceModal.show();
    };

    document.getElementById("fromBankBtn").onclick = () => {
        questionSourceModal.hide();
        questionBankModal.show();
    };

    document.getElementById("randomSelectBtn").onclick = () => {
        document.getElementById("randomQuestionInput").classList.remove("d-none");
        document.getElementById("manualQuestionList").classList.add("d-none");
        document.getElementById("addSelectedManualBtn").classList.add("d-none");
    };

    document.getElementById("manualPickBtn").onclick = () => {
        document.getElementById("manualQuestionList").classList.remove("d-none");
        document.getElementById("randomQuestionInput").classList.add("d-none");
        document.getElementById("addSelectedManualBtn").classList.remove("d-none");

        const subjectId = document.getElementById("subjectSelect").value;
        fetch(`/accounts/api/get-questions/${subjectId}/`)
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("manualQuestionList");
                container.innerHTML = data.questions.map(q => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${q.id}" id="question-${q.id}">
                        <label class="form-check-label" for="question-${q.id}">
                            <div class="question-text">${q.text}</div>
                            <div class="options">
                                <div class="option">A. ${q.option1}</div>
                                <div class="option">B. ${q.option2}</div>
                                ${q.option3 ? `<div class="option">C. ${q.option3}</div>` : ''}
                                ${q.option4 ? `<div class="option">D. ${q.option4}</div>` : ''}
                            </div>
                        </label>
                    </div>
                `).join('');
            });
    };

    document.getElementById("randomAddBtn").onclick = () => {
        const subjectId = document.getElementById("subjectSelect").value;
        const count = document.getElementById("randomCount").value;
        fetch(`/accounts/api/get-random-questions/${subjectId}/?count=${count}`)
            .then(res => res.json())
            .then(data => {
                data.questions.forEach(q => appendQuestion(q));
                questionBankModal.hide();
            });
    };

    document.getElementById("addSelectedManualBtn").onclick = () => {
        const selected = [...document.querySelectorAll('#manualQuestionList input:checked')].map(i => i.value);
        fetch(`/accounts/api/get-questions-by-ids/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ ids: selected })
        })
            .then(res => res.json())
            .then(data => {
                data.questions.forEach(q => appendQuestion(q));
                questionBankModal.hide();
            });
    };

    function appendQuestion(q) {
        const wrapper = document.createElement("div");
        wrapper.className = "question-item";
        wrapper.setAttribute("data-question-id", q.id);
        wrapper.innerHTML = `
            <div class="question-text">${q.text}</div>
            <div class="options">
                <div class="option">A. ${q.option1}</div>
                <div class="option">B. ${q.option2}</div>
                ${q.option3 ? `<div class="option">C. ${q.option3}</div>` : ''}
                ${q.option4 ? `<div class="option">D. ${q.option4}</div>` : ''}
            </div>
            <button type="button" class="btn btn-sm btn-danger mt-2" onclick="this.parentElement.remove()">Remove</button>
            <input type="hidden" name="selected_questions" value="${q.id}">
        `;
        testQuestionsDiv.appendChild(wrapper);
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const subjectSelect = document.getElementById("subject");
    const newSubjectInput = document.getElementById("subject_name");

    function toggleNewSubjectField() {
        if (!newSubjectInput) return;
        if (subjectSelect.value === "new" || subjectSelect.value === "") {
            if (newSubjectInput.parentElement) {
                newSubjectInput.parentElement.style.display = "block";
            }
            newSubjectInput.required = true;
        } else {
            if (newSubjectInput.parentElement) {
                newSubjectInput.parentElement.style.display = "none";
            }
            newSubjectInput.required = false;
        }
    }

    toggleNewSubjectField();
    subjectSelect.addEventListener("change", toggleNewSubjectField);

    const subjectDropdown = document.getElementById('subject');
    const newSubjectContainer = document.getElementById('newSubjectContainer');

    if (subjectDropdown && newSubjectContainer) {
        subjectDropdown.addEventListener('change', function () {
            if (this.value === 'new') {
                newSubjectContainer.classList.remove('d-none');
            } else {
                newSubjectContainer.classList.add('d-none');
                const subjectNameInput = document.getElementById('subjectName');
                if (subjectNameInput) subjectNameInput.value = '';
            }
        });
    }

    const addTestForm = document.getElementById('addTestForm');
    if (addTestForm) {
        addTestForm.addEventListener('submit', function(e) {
            const testName = document.getElementById('testName');
            const subject = document.getElementById('subject');

            if (!testName.value.trim()) {
                e.preventDefault();
                alert('Please enter a test name');
                testName.focus();
                return;
            }

            if (!subject.value) {
                e.preventDefault();
                alert('Please select a subject');
                subject.focus();
                return;
            }

            if (subject.value === 'new') {
                const subjectName = document.getElementById('subjectName');
                if (!subjectName.value.trim()) {
                    e.preventDefault();
                    alert('Please enter a new subject name');
                    subjectName.focus();
                    return;
                }
            }
        });
    }

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    });
});
