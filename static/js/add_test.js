document.addEventListener('DOMContentLoaded', function () {
    const testQuestionsDiv = document.getElementById("testQuestions");

    const questionSourceModal = new bootstrap.Modal(document.getElementById('questionSourceModal'));
    const questionBankModal = new bootstrap.Modal(document.getElementById('questionBankModal'));
    const manualCreateModal = new bootstrap.Modal(document.getElementById('manualCreateModal'));

    // Restore form field values from localStorage
    const testFormFields = ['testName', 'subject', 'subjectName', 'totalQuestions', 'totalMarks', 'totalTime', 'testPassword'];
    testFormFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            const saved = localStorage.getItem(`addTest_${id}`);
            if (saved) field.value = saved;
            field.addEventListener('input', () => {
                localStorage.setItem(`addTest_${id}`, field.value);
            });
        }
    });

    // Restore added questions
    const savedQuestions = JSON.parse(localStorage.getItem('addedQuestions') || '[]');
    savedQuestions.forEach(q => appendQuestion(q));

    // Append question to DOM and localStorage
    function appendQuestion(q) {
        if (document.querySelector(`[data-question-id='${q.id}']`)) return;

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
            <div class="difficulty-tag badge bg-secondary mb-2">Difficulty: <strong>${q.difficulty || 'N/A'}</strong></div>
            <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeQuestion(${q.id})">Remove</button>
            <input type="hidden" name="selected_questions" value="${q.id}">
        `;
        testQuestionsDiv.appendChild(wrapper);

        const current = JSON.parse(localStorage.getItem('addedQuestions') || '[]');
        if (!current.find(item => item.id === q.id)) {
            current.push(q);
            localStorage.setItem('addedQuestions', JSON.stringify(current));
        }
    }

    window.removeQuestion = function(id) {
        document.querySelector(`[data-question-id='${id}']`)?.remove();
        const current = JSON.parse(localStorage.getItem('addedQuestions') || '[]');
        const updated = current.filter(q => q.id !== id);
        localStorage.setItem('addedQuestions', JSON.stringify(updated));
    };

    // ========== RANDOM & MANUAL FETCH LOGIC ==========

    document.getElementById("addQuestionBtn").onclick = () => questionSourceModal.show();

    document.getElementById("fromBankBtn").onclick = () => {
        questionSourceModal.hide();
        questionBankModal.show();
    };

    document.getElementById("randomSelectBtn").onclick = () => {
        const randomInput = document.getElementById("randomQuestionInput");
        randomInput.classList.remove("d-none");
        document.getElementById("manualQuestionList").classList.add("d-none");
        document.getElementById("addSelectedManualBtn").classList.add("d-none");

        if (!document.getElementById("easyCount")) {
            const difficultyInputs = document.createElement("div");
            difficultyInputs.className = "form-row mt-2";
            difficultyInputs.innerHTML = `
                <div class="form-group col">
                    <label>Easy</label>
                    <input type="number" class="form-control" id="easyCount" min="0">
                </div>
                <div class="form-group col">
                    <label>Medium</label>
                    <input type="number" class="form-control" id="mediumCount" min="0">
                </div>
                <div class="form-group col">
                    <label>Hard</label>
                    <input type="number" class="form-control" id="hardCount" min="0">
                </div>
            `;
            randomInput.appendChild(difficultyInputs);
        }
    };

    document.getElementById("randomAddBtn").onclick = () => {
        const subjectId = document.getElementById("subjectSelect").value;
        const count = parseInt(document.getElementById("randomCount").value) || 0;

        const easy = parseInt(document.getElementById("easyCount")?.value || 0);
        const medium = parseInt(document.getElementById("mediumCount")?.value || 0);
        const hard = parseInt(document.getElementById("hardCount")?.value || 0);

        const totalSpecified = easy + medium + hard;
        if (totalSpecified > count) {
            alert(`Total difficulty-wise questions must not exceed ${count}`);
            return;
        }

        const queryParams = new URLSearchParams({ count, easy, medium, hard });

        fetch(`/accounts/api/get-random-questions/${subjectId}/?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                data.questions.forEach(q => appendQuestion(q));
                questionBankModal.hide();
            });
    };

    document.getElementById("manualPickBtn").onclick = () => {
        const subjectId = document.getElementById("subjectSelect").value;
        document.getElementById("manualQuestionList").classList.remove("d-none");
        document.getElementById("randomQuestionInput").classList.add("d-none");
        document.getElementById("addSelectedManualBtn").classList.remove("d-none");

        fetch(`/accounts/api/get-questions/${subjectId}/`)
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("manualQuestionList");
                container.innerHTML = data.questions.map(q => `
                    <div class="form-check mb-2 p-2 border rounded">
                        <input class="form-check-input" type="checkbox" value="${q.id}" id="question-${q.id}">
                        <label class="form-check-label w-100" for="question-${q.id}">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="question-text">${q.text}</div>
                                    <div class="options small text-muted mt-1">
                                        A. ${q.option1}<br>
                                        B. ${q.option2}<br>
                                        ${q.option3 ? `C. ${q.option3}<br>` : ''}
                                        ${q.option4 ? `D. ${q.option4}<br>` : ''}
                                    </div>
                                </div>
                                <span class="badge bg-secondary">Difficulty: ${q.difficulty || 'N/A'}</span>
                            </div>
                        </label>
                    </div>
                `).join('');
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

            // Clear form state from localStorage after successful submission
            testFormFields.forEach(id => localStorage.removeItem(`addTest_${id}`));
            localStorage.removeItem('addedQuestions');
        });
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
});
