// add_test.js

document.addEventListener('DOMContentLoaded', function () {
    const testQuestionsDiv = document.getElementById("testQuestions");

    document.getElementById("addQuestionBtn").onclick = () => {
        $('#questionSourceModal').modal('show');
    };

    document.getElementById("fromBankBtn").onclick = () => {
        $('#questionSourceModal').modal('hide');
        $('#questionBankModal').modal('show');
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
                $('#questionBankModal').modal('hide');
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
                $('#questionBankModal').modal('hide');
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

    // Utility function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const subjectSelect = document.getElementById("subject");
    const newSubjectInput = document.getElementById("subject_name");

    function toggleNewSubjectField() {
        if (subjectSelect.value === "new" || subjectSelect.value === "") {
            newSubjectInput.parentElement.style.display = "block";
            newSubjectInput.required = true;
        } else {
            newSubjectInput.parentElement.style.display = "none";
            newSubjectInput.required = false;
        }
    }

    toggleNewSubjectField();
    subjectSelect.addEventListener("change", toggleNewSubjectField);
});
