// scripts.js

// Function to check answer and update background colors
function checkAnswer(selectedOption, isCorrect) {
    const options = selectedOption.parentElement.children;
    let correctOption;

    // Disable clicking on options
    for (let option of options) {
        option.onclick = null;
    }

    if (isCorrect) {
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('incorrect');

        // Find the correct option and highlight it
        for (let option of options) {
            if (option.getAttribute('onclick').includes('true')) {
                correctOption = option;
                break;
            }
        }

        if (correctOption) {
            correctOption.classList.add('correct');
        }
    }
}

// Function to scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
