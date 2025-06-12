document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('DOMContentLoaded', function() {
    for (let i = 0; i < 4; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        document.body.appendChild(bubble);
    }
});
    const selectedQuestionsDiv = document.getElementById("selectedQuestionsList");
    const questionIdsInput = document.getElementById("questionIdsInput");

    // Preload existing question IDs
    function updateQuestionIds() {
        const ids = [...document.querySelectorAll("#selectedQuestionsList .selected-question")].map(div => div.dataset.id);
        questionIdsInput.value = ids.join(',');
    }
    updateQuestionIds();

    // Remove question
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-question') || e.target.closest('.remove-question')) {
            const btn = e.target.closest('.remove-question');
            const id = btn.dataset.id;
            document.querySelector(`.selected-question[data-id="${id}"]`)?.remove();
            updateQuestionIds();
        }
    });

    // Append question to DOM
    function appendQuestion(q) {
        if (document.querySelector(`[data-id='${q.id}']`)) return;

        const div = document.createElement('div');
        div.className = 'selected-question mb-3 p-3 border rounded shadow-sm bg-light';
        div.dataset.id = q.id;

        const correctMap = {
            option1: 'A',
            option2: 'B',
            option3: 'C',
            option4: 'D'
        };

        let correctText = q.correct_option && q[q.correct_option] 
            ? `${correctMap[q.correct_option]} (${q[q.correct_option]})`
            : 'N/A';

        div.innerHTML = `
            <strong>${q.text}</strong><br>
            A. ${q.option1}<br>
            B. ${q.option2}<br>
            ${q.option3 ? `C. ${q.option3}<br>` : ''}
            ${q.option4 ? `D. ${q.option4}<br>` : ''}
            <span class="badge bg-info text-dark">Difficulty: ${q.difficulty || 'N/A'}</span>
            <span class="badge bg-success">Correct: ${correctText}</span>
            <button type="button" class="btn btn-danger btn-sm remove-question" data-id="${q.id}">Remove</button>
            <hr>
        `;
        selectedQuestionsDiv.appendChild(div);
        updateQuestionIds();
    }

    // Reuse existing modals and logic
    const questionSourceModal = new bootstrap.Modal(document.getElementById('questionSourceModal'));
    const questionBankModal = new bootstrap.Modal(document.getElementById('questionBankModal'));
    const manualCreateModal = new bootstrap.Modal(document.getElementById('manualCreateModal'));

    // Trigger modal
    document.getElementById('addRandomBtn').onclick = () => {
        questionSourceModal.show();
    };

    document.getElementById('fromBankBtn').onclick = () => {
        questionSourceModal.hide();
        questionBankModal.show();
    };

    document.getElementById('manualCreateBtn').onclick = () => {
        const selectedSubject = document.getElementById("subjectSelect").value;
        if (!selectedSubject) {
            alert("Please select a subject first.");
            return;
        }
        document.getElementById("manualSubjectId").value = selectedSubject;
        questionSourceModal.hide();
        manualCreateModal.show();
    };

    // Random selection logic
    document.getElementById('randomSelectBtn').onclick = () => {
        document.getElementById("randomQuestionInput").classList.remove("d-none");
        document.getElementById("manualQuestionList").classList.add("d-none");
        document.getElementById("addSelectedManualBtn").classList.add("d-none");

        if (!document.getElementById("easyCount")) {
            const difficultyInputs = `
                <div class="form-group mt-2">
                    <label>Easy</label>
                    <input type="number" class="form-control" id="easyCount" min="0">
                    <label>Medium</label>
                    <input type="number" class="form-control" id="mediumCount" min="0">
                    <label>Hard</label>
                    <input type="number" class="form-control" id="hardCount" min="0">
                </div>
            `;
            document.getElementById("randomQuestionInput").insertAdjacentHTML("beforeend", difficultyInputs);
        }
    };

    document.getElementById('randomAddBtn').onclick = () => {
        const subjectId = document.getElementById("subjectSelect").value;
        const count = parseInt(document.getElementById("randomCount").value) || 0;

        const easy = parseInt(document.getElementById("easyCount")?.value || 0);
        const medium = parseInt(document.getElementById("mediumCount")?.value || 0);
        const hard = parseInt(document.getElementById("hardCount")?.value || 0);

        const totalSpecified = easy + medium + hard;
        if (totalSpecified > count) {
            alert(`Total difficulty-wise questions exceed ${count}.`);
            return;
        }

        const queryParams = new URLSearchParams({ count, easy, medium, hard });
        fetch(`/testmaster/api/get-random-questions/${subjectId}/?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                data.questions.forEach(q => appendQuestion(q));
                questionBankModal.hide();
            });
    };

    // Manual pick logic
    document.getElementById('manualPickBtn').onclick = () => {
        const subjectId = document.getElementById("subjectSelect").value;
        fetch(`/testmaster/api/get-questions/${subjectId}/`)
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("manualQuestionList");
                container.classList.remove("d-none");
                document.getElementById("randomQuestionInput").classList.add("d-none");
                document.getElementById("addSelectedManualBtn").classList.remove("d-none");
                container.innerHTML = data.questions.map(q => {
                    const correctMap = { option1: 'A', option2: 'B', option3: 'C', option4: 'D' };
let correctText = 'N/A';
if (q.correct_option && ['option1', 'option2', 'option3', 'option4'].includes(q.correct_option)) {
    const label = correctMap[q.correct_option];
    const value = q[q.correct_option] || '';
    if (value.trim() !== '') {
        correctText = `${label} (${value})`;
    }
}


                    return `
                        <div class="form-check mb-2 p-2 border rounded">
                            <input class="form-check-input" type="checkbox" value="${q.id}" id="question-${q.id}" data-question='${JSON.stringify(q)}'>
                            <label class="form-check-label w-100" for="question-${q.id}">
                                <strong>${q.text}</strong><br>
                                A. ${q.option1}<br>
                                B. ${q.option2}<br>
                                ${q.option3 ? `C. ${q.option3}<br>` : ''}
                                ${q.option4 ? `D. ${q.option4}<br>` : ''}
                                <div class="text-success"><strong>Correct:</strong> ${correctText}</div>
                                <span class="badge bg-info text-dark">Difficulty: ${q.difficulty || 'N/A'}</span>
                            </label>
                        </div>
                    `;
                }).join('');
            });
    };

    document.getElementById('addSelectedManualBtn').onclick = () => {
        const checkboxes = document.querySelectorAll('#manualQuestionList input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            const q = JSON.parse(cb.getAttribute('data-question'));
            appendQuestion(q);
        });
        questionBankModal.hide();
    };

    // Manual creation form
    const manualForm = document.getElementById("manualQuestionForm");
    manualForm?.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(manualForm).entries());

        fetch("/testmaster/api/add-manual-question/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify(data),
        })
        .then(res => res.json())
        .then(result => {
            if (result.question) {
                appendQuestion(result.question);
                manualForm.reset();
                manualCreateModal.hide();
            }
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
