// ------------ Modal Edit Logic ------------
function openEditModal(testId) {
    const row = document.querySelector(`tr[data-test-id='${testId}']`);
    const title = row.children[0].innerText;
    const subjectName = row.children[1].innerText;
    const code = row.children[3].innerText;

    document.getElementById('editTestId').value = testId;
    document.getElementById('editTitle').value = title;
    document.getElementById('editCode').value = code;

    // Placeholder values
    document.getElementById('editTime').value = 30;
    document.getElementById('editQuestions').value = "101,102,103";

    const subjectSelect = document.getElementById('editSubject');
    for (let opt of subjectSelect.options) {
        opt.selected = opt.text === subjectName;
    }

    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editModal').style.display = 'none';
}

// ------------ Edit Test Form Submit ------------
document.getElementById('editTestForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const testId = document.getElementById('editTestId').value;
    const payload = {
        title: document.getElementById('editTitle').value,
        subject_id: document.getElementById('editSubject').value,
        time: document.getElementById('editTime').value,
        code: document.getElementById('editCode').value,
        questions: document.getElementById('editQuestions').value.split(',').map(q => q.trim()),
    };

    fetch(`/organization/view-tests/edit/${testId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(payload),
    }).then(res => {
        if (res.ok) {
            closeEditModal();
            location.reload();
        } else {
            alert("Failed to update test.");
        }
    }).catch(err => {
        console.error("Edit error:", err);
        alert("Something went wrong.");
    });
});

// ------------ Cancel Test Logic ------------
function cancelTest(testId) {
    fetch(`/organization/view-tests/cancel/${testId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to cancel test.");
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            alert("Test cancelled successfully!");
            location.reload();
        } else {
            alert(data.message || "Failed to cancel test.");
        }
    })
    .catch(error => {
        console.error("Error cancelling test:", error);
        alert("An error occurred while cancelling the test.");
    });
}

// ------------ CSRF Token Fetcher ------------
function getCSRFToken() {
    const tokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (tokenInput) return tokenInput.value;

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute('content');

    // If none found, use globally set value (if any)
    if (window.csrfToken) return window.csrfToken;

    console.warn("CSRF token not found.");
    return '';
}
