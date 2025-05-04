const optionButtons = document.querySelectorAll('.option-btn');

optionButtons.forEach(button => {
    button.addEventListener('click', function () {
        const parent = this.parentElement;
        const allOptions = parent.querySelectorAll('.option-btn');
        const correctAnswer = this.getAttribute('data-correct').trim();

        allOptions.forEach(opt => {
            opt.disabled = true;
            if (opt.textContent.trim() === correctAnswer) {
                opt.classList.add('correct');
            }
        });

        if (this.textContent.trim() !== correctAnswer) {
            this.classList.add('wrong');
        }
    });
});
