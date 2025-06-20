document.addEventListener('DOMContentLoaded', function() {
  let testDetailModal = null;
  
  document.querySelectorAll('.test-title-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const testId = this.dataset.testId;
      
      fetch(`/testmaster/organization/view-tests/test-details/${testId}/`)
        .then(res => res.json())
        .then(data => {
          if (data.error) return alert(data.error);

          // Format the modal content (same as before)
          const orgName = data.organization_name || 
                         (data.test && data.test.organization && data.test.organization.name) || 
                         'ORGANIZATION';

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

          // Inject content into modal
          const modalBody = document.getElementById('testDetailContent');
          modalBody.innerHTML = content;

          // Initialize modal if not already done
          const modalElement = document.getElementById('testDetailModal');
          if (!testDetailModal) {
            testDetailModal = new bootstrap.Modal(modalElement);
          }
          
          // Show the modal
          testDetailModal.show();

          // Update PDF download button - KEY CHANGE IS HERE
          const downloadBtn = document.getElementById('downloadPdfBtn');
          if (downloadBtn) {
            // Remove any existing click handlers
            downloadBtn.onclick = null;
            
            // Set new handler to use Django PDF endpoint
            downloadBtn.onclick = () => {
              // Use the correct URL pattern from your urls.py
              window.location.href = `/testmaster/organization/view-tests/test-details/${testId}/pdf/`;
            };
          }
        })
        .catch(err => {
          alert('Failed to load test details. Please try again.');
          console.error(err);
        });
    });
  });

  // Modal close handler
  document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-close') || e.target.closest('[data-bs-dismiss="modal"]')) {
      if (testDetailModal) {
        testDetailModal.hide();
      }
    }
  });

  // DELETE CONFIRMATION MODAL
document.querySelectorAll('.btn-delete').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default navigation
    const deleteUrl = this.getAttribute('href');

    // Set the confirmation button's href in the modal
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    confirmDeleteBtn.setAttribute('href', deleteUrl);

    // Show the modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
  });
});

// SHARE LINK MODAL
document.querySelectorAll('.btn-share').forEach(button => {
  button.addEventListener('click', function () {
    const testId = this.getAttribute('data-test-id');
    const shareUrl = `${window.location.origin}/testmaster/user-dashboard/organization-tests/start-org-test/${testId}/`;

    const shareLinkInput = document.getElementById('shareLinkInput');
    shareLinkInput.value = shareUrl;

    const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
    shareModal.show();
  });
});

// COPY TO CLIPBOARD
document.getElementById('copyShareLinkBtn')?.addEventListener('click', () => {
  const shareLinkInput = document.getElementById('shareLinkInput');
  shareLinkInput.select();
  shareLinkInput.setSelectionRange(0, 99999); // for mobile

  try {
    document.execCommand('copy');
    const originalText = document.getElementById('copyShareLinkBtn').innerHTML;
    document.getElementById('copyShareLinkBtn').innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      document.getElementById('copyShareLinkBtn').innerHTML = originalText;
    }, 1500);
  } catch (err) {
    alert('Failed to copy link.');
  }
});

});