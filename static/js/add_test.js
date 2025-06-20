document.addEventListener('DOMContentLoaded', function () {

  
    const testQuestionsDiv = document.getElementById("testQuestions");
    const addQuestionBtnGlobal = document.getElementById("addQuestionBtn"); // Get the button globally

    // Ensure Bootstrap 5 is loaded if using 'new bootstrap.Modal'
    // If you are using Bootstrap 4, new bootstrap.Modal will not work.
    // For Bootstrap 5, ensure your modal close buttons use `data-bs-dismiss="modal"` instead of `data-dismiss="modal"`.
    let questionSourceModal, questionBankModal, manualCreateModal;
    try {
        questionSourceModal = new bootstrap.Modal(document.getElementById('questionSourceModal'));
        questionBankModal = new bootstrap.Modal(document.getElementById('questionBankModal'));
        manualCreateModal = new bootstrap.Modal(document.getElementById('manualCreateModal'));
    } catch (e) {
        console.error("Error initializing Bootstrap modals. Ensure Bootstrap 5 JS is loaded.", e);
        // Fallback or error display for user if modals are critical
        const modalErrorDiv = document.createElement('div');
        modalErrorDiv.className = 'alert alert-danger';
        modalErrorDiv.textContent = 'Error loading interactive components. Please ensure Bootstrap 5 is correctly set up.';
        document.body.insertBefore(modalErrorDiv, document.body.firstChild);
        return; // Stop further execution if modals can't be initialized
    }


    // Restore form field values from localStorage
    const testFormFields = ['testName', 'subject', 'totalQuestions', 'totalMarks', 'totalTime', 'testPassword'];
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
    // Special handling for subjectName because it's conditional
    const subjectNameField = document.getElementById('subjectName');
    if (subjectNameField) {
        const savedSubjectName = localStorage.getItem('addTest_subjectName');
        if (savedSubjectName && document.getElementById('subject')?.value === 'new') {
            subjectNameField.value = savedSubjectName;
        }
        subjectNameField.addEventListener('input', () => {
            if (document.getElementById('subject')?.value === 'new') {
                localStorage.setItem('addTest_subjectName', subjectNameField.value);
            }
        });
    }


    // Restore added questions
    const savedQuestions = JSON.parse(localStorage.getItem('addedQuestions') || '[]');
    savedQuestions.forEach(q => appendQuestion(q));

    // Append question to DOM and localStorage
    function appendQuestion(q) {
        if (document.querySelector(`[data-question-id='${q.id}']`)) return;

        const wrapper = document.createElement("div");
        wrapper.className = "question-item mb-3 p-3 border rounded shadow-sm bg-light"; // Added some BS classes
        wrapper.setAttribute("data-question-id", q.id);

        // Assuming q.correct_option stores the key like "option1", "option2"
        // And you want to display the actual text of the correct option.
        let correctOptionText = '';
        if (q.correct_option === 'option1') correctOptionText = q.option1;
        else if (q.correct_option === 'option2') correctOptionText = q.option2;
        else if (q.correct_option === 'option3') correctOptionText = q.option3;
        else if (q.correct_option === 'option4') correctOptionText = q.option4;
        else correctOptionText = q.correct_option; // Fallback

        wrapper.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="question-text fw-bold">${q.text}</div>
                    <div class="options small text-muted mt-1">
                        <div class="option">A. ${q.option1}</div>
                        <div class="option">B. ${q.option2}</div>
                        ${q.option3 ? `<div class="option">C. ${q.option3}</div>` : ''}
                        ${q.option4 ? `<div class="option">D. ${q.option4}</div>` : ''}
                    </div>
                    <div class="mt-2">
                        <span class="badge bg-success me-2">Correct: <strong>${correctOptionText}</strong></span>
                        <span class="badge bg-info text-dark">Difficulty: <strong>${q.difficulty || 'N/A'}</strong></span>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeQuestion(${q.id})">
                    <i class="fas fa-trash-alt me-1"></i>Remove
                </button>
            </div>
            <input type="hidden" name="selected_questions" value="${q.id}">
        `;

        if (testQuestionsDiv && addQuestionBtnGlobal && testQuestionsDiv.contains(addQuestionBtnGlobal)) {
            testQuestionsDiv.insertBefore(wrapper, addQuestionBtnGlobal);
        } else if (testQuestionsDiv) {
            testQuestionsDiv.appendChild(wrapper);
        }


        const current = JSON.parse(localStorage.getItem('addedQuestions') || '[]');
        if (!current.find(item => item.id === q.id)) {
            current.push(q);
            localStorage.setItem('addedQuestions', JSON.stringify(current));
        }
    }

    window.removeQuestion = function(id) {
        document.querySelector(`[data-question-id='${id}']`)?.remove();
        const current = JSON.parse(localStorage.getItem('addedQuestions') || '[]');
        const updated = current.filter(q => q.id !== id && q.id !== String(id)); // Handle number vs string id
        localStorage.setItem('addedQuestions', JSON.stringify(updated));
    };

    // Handle "Add New Subject" visibility
    const subjectDropdown = document.getElementById('subject');
    const newSubjectContainer = document.getElementById('newSubjectContainer');
    const subjectNameInput = document.getElementById('subjectName');

    if (subjectDropdown && newSubjectContainer && subjectNameInput) {
        const updateNewSubjectVisibility = () => {
            if (subjectDropdown.value === 'new') {
                newSubjectContainer.classList.remove('d-none');
                subjectNameInput.required = true;
            } else {
                newSubjectContainer.classList.add('d-none');
                subjectNameInput.required = false;
                subjectNameInput.value = ''; // Clear if user switches back
            }
        };

        subjectDropdown.addEventListener('change', function() {
            updateNewSubjectVisibility();
            localStorage.setItem('addTest_subject', this.value);
            if (this.value === 'new') {
                // subjectNameInput's own listener will handle saving its value
            } else {
                localStorage.removeItem('addTest_subjectName');
            }
        });

        subjectNameInput.addEventListener('input', () => {
            if (subjectDropdown.value === 'new') {
                localStorage.setItem('addTest_subjectName', subjectNameInput.value);
            }
        });

        // Initialize on page load based on localStorage
        const savedSubject = localStorage.getItem('addTest_subject');
        if (savedSubject) {
            subjectDropdown.value = savedSubject; // Set dropdown value first
            updateNewSubjectVisibility(); // Then update visibility based on it
            if (savedSubject === 'new') {
                const savedSubjectNameVal = localStorage.getItem('addTest_subjectName');
                if (savedSubjectNameVal) {
                    subjectNameInput.value = savedSubjectNameVal;
                }
            }
        } else {
            updateNewSubjectVisibility(); // Set initial state if nothing in local storage
        }
    }


    // ========== MODAL TRIGGERS AND QUESTION FETCHING LOGIC ==========

    const addQuestionBtn = document.getElementById("addQuestionBtn");
    if (addQuestionBtn) {
        addQuestionBtn.onclick = () => questionSourceModal.show();
    }

    const fromBankBtn = document.getElementById("fromBankBtn");
    if (fromBankBtn) {
        fromBankBtn.onclick = () => {
            questionSourceModal.hide();
            questionBankModal.show();
        };
    }

    // --- START: Manual Question Creation Logic ---
    const manualCreateBtn = document.getElementById("manualCreateBtn");
    if (manualCreateBtn) {
        manualCreateBtn.onclick = () => {
            const mainSubjectDropdown = document.getElementById("subject");
            const selectedSubjectId = mainSubjectDropdown.value;
            const manualSubjectIdField = document.getElementById("manualSubjectId");

            if (selectedSubjectId && selectedSubjectId !== 'new' && manualSubjectIdField) {
                manualSubjectIdField.value = selectedSubjectId;
                questionSourceModal.hide();
                manualCreateModal.show();
            } else if (selectedSubjectId === 'new') {
                // TODO: Replace alert with a non-blocking UI notification if possible
                alert("Please save the new subject by creating the test first, or select an existing subject to add questions manually.");
            } else {
                // TODO: Replace alert with a non-blocking UI notification if possible
                alert("Please select a subject for the test before adding questions manually.");
            }
        };
    }

    const manualQuestionForm = document.getElementById('manualQuestionForm');
    if (manualQuestionForm) {
        manualQuestionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const questionData = Object.fromEntries(formData.entries());

            // Basic client-side validation (enhance as needed)
            if (!questionData.text?.trim() || !questionData.option1?.trim() || !questionData.option2?.trim() || 
                !questionData.correct_option || !questionData.difficulty || !questionData.subject_id) {
                // TODO: Replace alert with a non-blocking UI notification or inline validation messages
                alert('Please fill all required fields for the question accurately.');
                return;
            }

            // You need a backend endpoint to save this question.
            fetch('/testmaster/api/add-manual-question/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Ensure getCookie function is available
                },
                body: JSON.stringify(questionData)
            })
            .then(response => {
                if (!response.ok) {
                    // Try to parse error message from backend if available
                    return response.json().then(errData => {
                        throw new Error(errData.error || errData.detail || `Server responded with status ${response.status}`);
                    }).catch(() => { // Fallback if response is not JSON or error parsing fails
                        throw new Error(`Server responded with status ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.question && data.question.id) {
                    appendQuestion(data.question); // appendQuestion expects the question object
                    manualCreateModal.hide();
                    this.reset(); // Reset the form fields
                } else {
                    console.error("Invalid response structure from server:", data);
                    // TODO: Replace alert with a non-blocking UI notification
                    alert('Error: Could not add question. Invalid response from server.');
                }
            })
            .catch(error => {
                console.error('Error adding question manually:', error);
                // TODO: Replace alert with a non-blocking UI notification
                alert(`Could not save question: ${error.message}`);
            });
        });
    }
    // --- END: Manual Question Creation Logic ---


    // --- START: From Question Bank Logic (Random & Manual Pick) ---
    const randomSelectBtn = document.getElementById("randomSelectBtn");
    const manualPickBtn = document.getElementById("manualPickBtn");
    const randomQuestionInputDiv = document.getElementById("randomQuestionInput");
    const manualQuestionListDiv = document.getElementById("manualQuestionList");
    const addSelectedManualBtn = document.getElementById("addSelectedManualBtn");
    const randomAddBtn = document.getElementById("randomAddBtn");

    if (randomSelectBtn) {
        randomSelectBtn.onclick = () => {
            if (!randomQuestionInputDiv || !manualQuestionListDiv || !addSelectedManualBtn) return;
            randomQuestionInputDiv.classList.remove("d-none");
            manualQuestionListDiv.classList.add("d-none");
            addSelectedManualBtn.classList.add("d-none");

            // Dynamically add difficulty inputs if they don't exist
            if (!document.getElementById("easyCount") && randomQuestionInputDiv) {
                const difficultyInputs = document.createElement("div");
                difficultyInputs.className = "form-row mt-3"; // Use form-row for Bootstrap 4, or d-flex/grid for BS5
                difficultyInputs.innerHTML = `
                    <div class="form-group col-md-4 col-sm-12 mb-2">
                        <label for="easyCount" class="form-label">Easy</label>
                        <input type="number" class="form-control form-control-sm" id="easyCount" min="0" placeholder="0">
                    </div>
                    <div class="form-group col-md-4 col-sm-12 mb-2">
                        <label for="mediumCount" class="form-label">Medium</label>
                        <input type="number" class="form-control form-control-sm" id="mediumCount" min="0" placeholder="0">
                    </div>
                    <div class="form-group col-md-4 col-sm-12 mb-2">
                        <label for="hardCount" class="form-label">Hard</label>
                        <input type="number" class="form-control form-control-sm" id="hardCount" min="0" placeholder="0">
                    </div>
                `;
                // Insert after the "How many questions?" input, or append if structure is simpler
                    const wrapper = document.getElementById("difficultyInputsWrapper");
    if (wrapper) {
        wrapper.appendChild(difficultyInputs);
    }
            }
        };
    }

    if (randomAddBtn) {
        randomAddBtn.onclick = () => {
            const subjectId = document.getElementById("subjectSelect")?.value;
            const countInput = document.getElementById("randomCount");
            const count = parseInt(countInput?.value) || 0;

            if (!subjectId) { alert("Please select a subject."); return; }
            if (count <= 0 && (!document.getElementById("easyCount") || !document.getElementById("mediumCount") || !document.getElementById("hardCount")) ) { // if difficulty counts are not present, main count is required
                 alert("Please specify number of questions."); return;
            }


            const easy = parseInt(document.getElementById("easyCount")?.value || 0);
            const medium = parseInt(document.getElementById("mediumCount")?.value || 0);
            const hard = parseInt(document.getElementById("hardCount")?.value || 0);
            
            const totalSpecifiedByDifficulty = easy + medium + hard;

            let finalCount = count;
            if (totalSpecifiedByDifficulty > 0 && count > 0 && totalSpecifiedByDifficulty > count) {
                alert(`The sum of difficulty-wise questions (${totalSpecifiedByDifficulty}) does not match the total random questions specified (${count}). Please adjust.`);
                return;
            } else if (totalSpecifiedByDifficulty > 0 && count === 0) {
                finalCount = totalSpecifiedByDifficulty; // Use sum of difficulties if main count is 0
                if (countInput) countInput.value = finalCount; // Update the UI for clarity
            } else if (totalSpecifiedByDifficulty === 0 && count === 0) {
                alert("Please specify either a total number of questions or counts for difficulties."); return;
            }


            // If only total count is given, backend will handle random difficulties.
            // If difficulty counts are given, backend should respect them.
            const queryParams = new URLSearchParams({ count: finalCount, easy, medium, hard });

            fetch(`/testmaster/api/get-random-questions/${subjectId}/?${queryParams.toString()}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Error fetching random questions: ${res.statusText}`);
                    return res.json();
                })
                .then(data => {
                    if (data.questions && data.questions.length > 0) {
                        data.questions.forEach(q => appendQuestion(q));
                        questionBankModal.hide();
                    } else if (data.questions && data.questions.length === 0) {
                        alert("No questions found matching your criteria for this subject.");
                    } else {
                         alert("Could not retrieve questions. Please check the subject and try again.");
                    }
                })
                .catch(error => {
                    console.error("Fetch error for random questions:", error);
                    alert(`An error occurred: ${error.message}`);
                });
        };
    }

    if (manualPickBtn) {
        manualPickBtn.onclick = () => {
            const subjectId = document.getElementById("subjectSelect")?.value;
            if (!subjectId) { alert("Please select a subject first."); return; }
            if (!manualQuestionListDiv || !randomQuestionInputDiv || !addSelectedManualBtn) return;

            manualQuestionListDiv.classList.remove("d-none");
            randomQuestionInputDiv.classList.add("d-none");
            addSelectedManualBtn.classList.remove("d-none");
            manualQuestionListDiv.innerHTML = '<div class="text-center p-3"><i class="fas fa-spinner fa-spin"></i> Loading questions...</div>'; // Loading indicator

            fetch(`/testmaster/api/get-questions/${subjectId}/`)
                .then(res => {
                    if (!res.ok) throw new Error(`Error fetching questions: ${res.statusText}`);
                    return res.json();
                })
                .then(data => {
                    if (data.questions && data.questions.length > 0) {
                        manualQuestionListDiv.innerHTML = data.questions.map(q => {
    const correctMap = {
        option1: 'A',
        option2: 'B',
        option3: 'C',
        option4: 'D'
    };
let correctText = 'N/A';
if (q.correct_option && ['option1', 'option2', 'option3', 'option4'].includes(q.correct_option)) {
    const label = correctMap[q.correct_option];
    const value = q[q.correct_option] || '';
    if (value.trim() !== '') {
        correctText = `${label} (${value})`;
    }
}
const correctOption = `<div class="mt-1 text-success small"><strong>Correct:</strong> ${correctText}</div>`;


    return `
        <div class="form-check mb-2 p-2 border rounded hover-bg-light">
            <input class="form-check-input" type="checkbox" value="${q.id}" id="question-${q.id}" data-question='${JSON.stringify(q)}'>
            <label class="form-check-label w-100 cursor-pointer" for="question-${q.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="question-text fw-bold">${q.text}</div>
                        <div class="options small text-muted mt-1">
                            A. ${q.option1}<br>
                            B. ${q.option2}<br>
                            ${q.option3 ? `C. ${q.option3}<br>` : ''}
                            ${q.option4 ? `D. ${q.option4}<br>` : ''}
                        </div>
                        ${correctOption}
                    </div>
                    <span class="badge bg-info text-dark ms-2">Difficulty: ${q.difficulty || 'N/A'}</span>
                </div>
            </label>
        </div>
    `;
}).join('');

                    } else {
                        manualQuestionListDiv.innerHTML = '<div class="alert alert-warning">No questions available for this subject.</div>';
                    }
                })
                .catch(error => {
                    console.error("Fetch error for manual pick questions:", error);
                    manualQuestionListDiv.innerHTML = `<div class="alert alert-danger">Error loading questions: ${error.message}</div>`;
                });
        };
    }

    if (addSelectedManualBtn) {
        addSelectedManualBtn.onclick = () => {
            const selectedCheckboxes = document.querySelectorAll('#manualQuestionList input[type="checkbox"]:checked');
            if (selectedCheckboxes.length === 0) {
                alert("Please select at least one question.");
                return;
            }
            selectedCheckboxes.forEach(checkbox => {
                try {
                    const questionData = JSON.parse(checkbox.getAttribute('data-question'));
                    appendQuestion(questionData);
                } catch(e) {
                    console.error("Error parsing question data from checkbox:", e);
                }
            });
            questionBankModal.hide();
        };
    }
    // --- END: From Question Bank Logic ---


    // Final form submission validation
    const addTestForm = document.getElementById('addTestForm');
    if (addTestForm) {
        addTestForm.addEventListener('submit', function(e) {
            // Basic Validations (enhance as needed)
            const testName = document.getElementById('testName');
            const subject = document.getElementById('subject');
            const newSubjectName = document.getElementById('subjectName');
            const totalQuestions = document.getElementById('totalQuestions');
            const addedQuestionsCount = document.querySelectorAll('#testQuestions .question-item').length;

            if (!testName.value.trim()) {
                e.preventDefault(); alert('Please enter a test name.'); testName.focus(); return;
            }
            if (!subject.value) {
                e.preventDefault(); alert('Please select a subject.'); subject.focus(); return;
            }
            if (subject.value === 'new' && !newSubjectName.value.trim()) {
                e.preventDefault(); alert('Please enter the new subject name.'); newSubjectName.focus(); return;
            }
            if (parseInt(totalQuestions.value) !== addedQuestionsCount) {
                e.preventDefault();
                alert(`The 'Total Questions' (${totalQuestions.value}) does not match the number of questions added (${addedQuestionsCount}). Please adjust.`);
                totalQuestions.focus();
                return;
            }

            // Clear form state from localStorage after successful submission (or on attempt)
            // It's better to clear this on the server's successful response/redirect,
            // but if not possible, clearing here is an option.
            // Consider only clearing on success.
            testFormFields.forEach(id => localStorage.removeItem(`addTest_${id}`));
            localStorage.removeItem('addTest_subjectName');
            localStorage.removeItem('addedQuestions');
        });
    }

    // Helper function to get CSRF cookie (Django specific)
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