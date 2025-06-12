document.addEventListener('DOMContentLoaded', function () {
  const coursesBtn = document.getElementById('courses-btn');
  const modal = document.getElementById('coming-soon-modal');
  const closeBtn = document.getElementById('close-modal');

  coursesBtn.addEventListener('click', function (e) {
    e.preventDefault();  // prevent page jump
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
