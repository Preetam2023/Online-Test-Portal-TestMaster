document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const selectTrigger = document.querySelector('.select-trigger');
    const selectOptions = document.querySelector('.select-options');
    const selectedLang = document.getElementById('selected-lang');
    const selectedLogo = document.getElementById('selected-logo');
    const languageInput = document.createElement('input');
    languageInput.type = 'hidden';
    languageInput.id = 'language';
    document.body.appendChild(languageInput);
    
    const output = document.getElementById('output');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Initialize CodeMirror Editor
    const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        mode: null, // Start with no mode (will be set when language selected)
        theme: 'dracula',
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": function() { runCode(); }
        }
    });

    // Language selection functionality
    selectTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
    });

    selectOptions.addEventListener('click', function(e) {
        const option = e.target.closest('div[data-lang]');
        if (!option) return;
        
        const lang = option.getAttribute('data-lang');
        const imgSrc = option.getAttribute('data-img');
        
        selectedLang.textContent = option.textContent.trim();
        selectedLogo.src = imgSrc;
        languageInput.value = lang;
        
        updateEditorContent(lang);
        selectOptions.style.display = 'none';
        
        // Automatically run the code when language is selected
        setTimeout(runCode, 500);
    });

    // Update editor content and syntax mode based on language
    function updateEditorContent(lang) {
        const languageModes = {
            'python3': 'python',
            'java': 'text/x-java',
            'c': 'text/x-csrc'
        };
        
        const defaultCodes = {
            'python3': '# Python 3 Hello World\nprint("Hello, World!")\n\n# Try changing this message and run again!',
            'java': '// Java Hello World\nclass Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n\n// Try changing this message and run again!',
            'c': '// C Hello World\n#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}\n\n// Try changing this message and run again!'
        };
        
        // Set syntax highlighting mode
        editor.setOption('mode', languageModes[lang]);
        // Set default code
        editor.setValue(defaultCodes[lang] || '// Select a language to begin\n// Then click Run or modify the code');
    }

    // Run code functionality
    function runCode() {
        const code = editor.getValue();
        const language = languageInput.value;

        if (!language) {
            output.textContent = 'Error: Please select a language first.';
            output.classList.add('error');
            return;
        }

        output.textContent = 'Running...';
        output.classList.remove('error');

        fetch('/accounts/user-dashboard/code-editor/run-code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrf-token]').content
            },
            body: JSON.stringify({ code, language })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                output.textContent = data.error;
                output.classList.add('error');
            } else {
                output.textContent = data.output || 'Code executed successfully (no output)';
                output.classList.remove('error');
            }
        })
        .catch(error => {
            output.textContent = 'Error: ' + error.message;
            output.classList.add('error');
        });
    }

    // Clear output functionality
    clearBtn.addEventListener('click', function() {
        output.textContent = '';
        output.classList.remove('error');
    });

    // Initialize with no default language selected
    selectedLang.textContent = 'Select Language';
    selectedLogo.src = '';
    editor.setValue('// Select a language from the dropdown to begin\n// Then click Run or modify the code');
});