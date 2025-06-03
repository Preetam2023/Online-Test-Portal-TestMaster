document.addEventListener('DOMContentLoaded', function() {
  // Initialize modal variable outside the click handler
  let testDetailModal = null;
  
  document.querySelectorAll('.test-title-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const testId = this.dataset.testId;
      fetch(`/accounts/organization/view-tests/test-details/${testId}/`)
        .then(res => res.json())
        .then(data => {
          if (data.error) return alert(data.error);

          // Get organization name from the response or use default
          const orgName = data.organization_name || 
                         (data.test && data.test.organization && data.test.organization.name) || 
                         'ORGANIZATION';

          // Format questions
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

          // Create the question paper content with multiple watermarks
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
                
                <div class="paper-footer">
                </div>
              </div>
            </div>
          `;

          // Inject into modal body
          const modalBody = document.getElementById('testDetailContent');
          modalBody.innerHTML = content;

          // Initialize or get modal instance
          const modalElement = document.getElementById('testDetailModal');
          if (!testDetailModal) {
            testDetailModal = new bootstrap.Modal(modalElement);
          }
          
          // Show the modal
          testDetailModal.show();

          // PDF download functionality
          const downloadBtn = document.getElementById('downloadPdfBtn');
          if (downloadBtn) {
            downloadBtn.onclick = () => {
              const element = document.querySelector('.question-paper');
              if (element) {
                const opt = {
                  margin: 5,
                  filename: `${data.title.replace(/\s+/g, '_')}_Question_Paper.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { 
                    scale: 5,
                    logging: true,
                    useCORS: true,
                    allowTaint: true
                  },
                  jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                  },
                  pagebreak: { mode: 'avoid-all' }
                };
                
                // Create a clone to avoid modal styling issues
                const clone = element.cloneNode(true);
                clone.style.padding = '2.5cm';
                document.body.appendChild(clone);
                
                html2pdf().from(clone).set(opt).save().then(() => {
                  document.body.removeChild(clone);
                });
              }
            };
          }
        })
        .catch(err => {
          alert('Failed to load test details. Please try again.');
          console.error(err);
        });
    });
  });

  // Add event listener for the close button (as fallback)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-close') || e.target.closest('[data-bs-dismiss="modal"]')) {
      if (testDetailModal) {
        testDetailModal.hide();
      }
    }
  });
});