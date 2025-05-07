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

document.addEventListener('DOMContentLoaded', function () {
    const subjectDropdown = document.getElementById('subject');
    const newSubjectContainer = document.getElementById('newSubjectContainer');

    subjectDropdown.addEventListener('change', function () {
        if (this.value === 'new') {
            newSubjectContainer.classList.remove('d-none');
        } else {
            newSubjectContainer.classList.add('d-none');
            document.getElementById('subjectName').value = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Show/hide new subject input
    const subjectSelect = document.getElementById('subject');
    const newSubjectContainer = document.getElementById('newSubjectContainer');
    
    if (subjectSelect && newSubjectContainer) {
      subjectSelect.addEventListener('change', function() {
        if (this.value === 'new') {
          newSubjectContainer.classList.remove('d-none');
        } else {
          newSubjectContainer.classList.add('d-none');
        }
      });
    }
  
    // Question source modal
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionSourceModal = new bootstrap.Modal(document.getElementById('questionSourceModal'));
    const questionBankModal = new bootstrap.Modal(document.getElementById('questionBankModal'));
    
    if (addQuestionBtn) {
      addQuestionBtn.addEventListener('click', function() {
        questionSourceModal.show();
      });
    }
  
    // From question bank button
    const fromBankBtn = document.getElementById('fromBankBtn');
    if (fromBankBtn) {
      fromBankBtn.addEventListener('click', function() {
        questionSourceModal.hide();
        questionBankModal.show();
      });
    }
  
    // Question bank modal functionality
    const randomSelectBtn = document.getElementById('randomSelectBtn');
    const manualPickBtn = document.getElementById('manualPickBtn');
    const randomQuestionInput = document.getElementById('randomQuestionInput');
    const manualQuestionList = document.getElementById('manualQuestionList');
    const addSelectedManualBtn = document.getElementById('addSelectedManualBtn');
    
    if (randomSelectBtn && manualPickBtn) {
      randomSelectBtn.addEventListener('click', function() {
        randomQuestionInput.classList.remove('d-none');
        manualQuestionList.classList.add('d-none');
        addSelectedManualBtn.classList.add('d-none');
      });
      
      manualPickBtn.addEventListener('click', function() {
        randomQuestionInput.classList.add('d-none');
        manualQuestionList.classList.remove('d-none');
        addSelectedManualBtn.classList.remove('d-none');
        
        // In a real implementation, you would fetch questions for the selected subject here
        // and populate the manualQuestionList div
        manualQuestionList.innerHTML = `
          <div class="question-item mb-3 p-3 border rounded">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="question1" checked>
              <label class="form-check-label" for="question1">
                What is the capital of France?
              </label>
            </div>
          </div>
          <div class="question-item mb-3 p-3 border rounded">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="question2">
              <label class="form-check-label" for="question2">
                Solve for x: 2x + 5 = 15
              </label>
            </div>
          </div>
          <div class="question-item mb-3 p-3 border rounded">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="question3" checked>
              <label class="form-check-label" for="question3">
                Who wrote "Romeo and Juliet"?
              </label>
            </div>
          </div>
        `;
      });
    }
  
    // Form validation
    const addTestForm = document.getElementById('addTestForm');
    if (addTestForm) {
      addTestForm.addEventListener('submit', function(e) {
        // Basic validation - in a real app you'd add more comprehensive validation
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
  
    // Add ripple effect to buttons
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
  
