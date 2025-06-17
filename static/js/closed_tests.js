document.addEventListener('DOMContentLoaded', function () {
    // ------------------------ Tooltip Init ------------------------
    const tooltipElements = document.querySelectorAll('.action-buttons button');

    tooltipElements.forEach(el => {
        const tooltipText = el.getAttribute('title');
        if (tooltipText) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            el.appendChild(tooltip);

            el.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });

            el.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });
        }
    });

    // ------------------------ Modal Restore/Delete ------------------------
    // ------------------------ Modal Restore/Delete ------------------------
const modal = document.getElementById('confirmationModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const closeModal = document.querySelector('.close-modal');

let currentAction = null;
let currentTestId = null;

// Utility to open modal
function openModal(title, message, action, testId) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    currentAction = action;
    currentTestId = testId;
    modal.classList.add('show');
    modal.style.display = 'block';
}

// Utility to close modal
function closeModalFunc() {
    modal.classList.remove('show');
    modal.style.display = 'none';
    currentAction = null;
    currentTestId = null;
}

// Attach click events
document.querySelectorAll('.btn-restore').forEach(btn => {
    btn.addEventListener('click', function () {
        const testId = this.getAttribute('data-test-id');
        openModal(
            'Restore Test',
            'Are you sure you want to restore this test? It will be available in the active tests list.',
            'restore',
            testId
        );
    });
});

document.querySelectorAll('.btn-permanent-delete').forEach(btn => {
    btn.addEventListener('click', function () {
        const testId = this.getAttribute('data-test-id');
        openModal(
            'Permanently Delete Test',
            'This action cannot be undone. All test data will be permanently deleted. Are you sure?',
            'delete',
            testId
        );
    });
});

closeModal?.addEventListener('click', closeModalFunc);
modalCancel?.addEventListener('click', closeModalFunc);

// Confirm button logic
modalConfirm?.addEventListener('click', function () {
    if (currentAction && currentTestId) {
        if (currentAction === 'restore') {
            window.location.href = `/testmaster/organization/closed-tests/restore/${currentTestId}/`;
        } else if (currentAction === 'delete') {
            window.location.href = `/testmaster/organization/closed-tests/permanently-delete/${currentTestId}/`;
        }
    }
    closeModalFunc();
});

// Clicking outside modal closes it
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModalFunc();
    }
});


    // ------------------------ QUESTION PAPER PREVIEW ------------------------
        let closedTestDetailModal = null;
    let modalBackdrop = null;
    
    document.querySelectorAll('.closed-test-title-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const testId = this.dataset.testId;
            
            // Clear any existing backdrop
            if (modalBackdrop && document.body.contains(modalBackdrop)) {
                modalBackdrop.remove();
                modalBackdrop = null;
}


            fetch(`/testmaster/organization/closed-tests/test-details/${testId}/`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    if (data.error) {
                        console.error('Server error:', data.error);
                        return alert(data.error);
                    }

                    // Format the modal content
                    const orgName = data.organization_name || 'ORGANIZATION';
                    const questionsHtml = data.questions.map((q, i) => `
                        <div class="question-block">
                            <div class="question-text">Q${i + 1}. ${q.text}</div>
                            <ul class="options-list">
                                <li data-option="A">${q.option1}</li>
                                <li data-option="B">${q.option2}</li>
                                ${q.option3 ? `<li data-option="C">${q.option3}</li>` : ''}
                                ${q.option4 ? `<li data-option="D">${q.option4}</li>` : ''}
                            </ul>
                        </div>
                    `).join('');

                    const content = `
                        <div class="question-paper">
                            <div class="watermark-layer">
                                <div class="watermark watermark-1">${orgName}</div>
                                <div class="watermark watermark-2">${orgName}</div>
                                <div class="watermark watermark-3">${orgName}</div>
                            </div>
                            <div class="paper-content" style="position:relative;z-index:1">
                                <div class="paper-header">
                                    ${data.org_logo ? `<img src="${data.org_logo}" alt="Logo" class="org-logo">` : ''}
                                    <h1 class="paper-title">${data.title}</h1>
                                    <div class="paper-meta">
                                        <span class="paper-meta-item"><i class="fas fa-hashtag"></i> Code: ${data.code}</span>
                                        <span class="paper-meta-item"><i class="fas fa-clock"></i> Duration: ${data.duration} mins</span>
                                        <span class="paper-meta-item"><i class="fas fa-star"></i> Marks: ${data.marks}</span>
                                    </div>
                                </div>
                                <div class="divider"></div>
                                <div class="questions-section">
                                    ${questionsHtml}
                                </div>
                            </div>
                        </div>
                    `;

                    document.getElementById('closedTestDetailContent').innerHTML = content;
                    
                    // Initialize modal if not already done
                    const modalElement = document.getElementById('closedTestDetailModal');
                    if (!closedTestDetailModal) {
                        closedTestDetailModal = new bootstrap.Modal(modalElement, {
                            backdrop: true, // Enable backdrop
                            keyboard: true  // Allow ESC key to close
                        });
                        
                        // Handle modal hidden event
                        modalElement.addEventListener('hidden.bs.modal', function() {
                            if (modalBackdrop) {
                                document.body.removeChild(modalBackdrop);
                                modalBackdrop = null;
                            }
                        });
                    }
                    
                    // Show the modal
                    closedTestDetailModal.show();
                    
                    // Ensure backdrop is clickable
                    modalBackdrop = document.querySelector('.modal-backdrop');
                    if (modalBackdrop) {
                        modalBackdrop.style.zIndex = '1040'; // Below modal but above everything else
                        modalBackdrop.addEventListener('click', function() {
                            closedTestDetailModal.hide();
                        });
                    }

                    // Update PDF download button
                    const downloadBtn = document.getElementById('closedDownloadPdfBtn');
                    if (downloadBtn) {
                        downloadBtn.onclick = () => {
                            window.location.href = `/accounts/organization/closed-tests/test-details/${testId}/pdf/`;
                        };
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    alert('Failed to load test details. Please try again.');
                });
        });
    });

    // Handle modal close via close button
    document.querySelector('#closedTestDetailModal .btn-close').addEventListener('click', function() {
        if (closedTestDetailModal) {
            closedTestDetailModal.hide();
        }
    });

});