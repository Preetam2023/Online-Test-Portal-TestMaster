const selectBtn = document.querySelector('.custom-select-btn');
const selectOptions = document.querySelector('.custom-select-options');
const selectedLang = document.getElementById('selected-lang');
const selectedLogo = document.getElementById('selected-logo');

// Toggle the custom select dropdown
selectBtn.addEventListener('click', () => {
    selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
});

// Handle option click
selectOptions.addEventListener('click', (e) => {
    if (e.target.closest('div[data-lang]')) {
        const selectedOption = e.target.closest('div[data-lang]');
        const lang = selectedOption.getAttribute('data-lang');
        const imgSrc = selectedOption.getAttribute('data-img');
        
        selectedLang.textContent = selectedOption.textContent.trim();

        // Show the logo and make sure it's the right size
        selectedLogo.src = imgSrc;
        selectedLogo.style.display = 'inline-block';
        selectedLogo.style.width = '20px';
        selectedLogo.style.height = '20px';

        selectOptions.style.display = 'none';
        document.getElementById('language').value = lang;
    }
});

document.getElementById('run').onclick = function() {
    const code = document.getElementById('editor').value;
    const language = document.getElementById('language').value;

    if (!language || !code) {
        document.getElementById('output').textContent = 'Error: Please provide both code and select a language.';
        document.getElementById('output').classList.add('error');
        return;
    }

    const requestBody = JSON.stringify({ code: code, language: language });

    fetch('/accounts/user-dashboard/code-editor/run-code/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token }}'
        },
        body: requestBody
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('output').classList.remove('error');
        if (data.output) {
            document.getElementById('output').textContent = data.output;
        } else if (data.error) {
            document.getElementById('output').textContent = 'Error: ' + data.error;
        } else {
            document.getElementById('output').textContent = 'No output returned or an error occurred.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('output').textContent = 'Error: ' + error.message;
        document.getElementById('output').classList.add('error');
    });
};
