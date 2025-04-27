// scripts.js

// Function to check answer and update background colors
// scripts.js

// Check answer and color code
function checkAnswer(selectedOption, isCorrect) {
    const options = selectedOption.parentElement.children;
    let correctOption;

    for (let option of options) {
        option.onclick = null; // disable all
    }

    if (isCorrect) {
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('incorrect');
        for (let option of options) {
            if (option.getAttribute('onclick')?.includes('true')) {
                correctOption = option;
                break;
            }
        }
        if (correctOption) correctOption.classList.add('correct');
    }
}

// Scroll to section (if needed)
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}
