let timer;
let timeLeft = 1200; // 20 minutes in seconds
let score = 0;
let selectedSubject = '';
let questions = []; // Global variable to store questions

// Get the subject from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
selectedSubject = urlParams.get('subject');
document.getElementById('test-subject').innerText = selectedSubject;

// Hide Start Test button if declaration is not checked
function toggleStartButton() {
    const declarationChecked = document.getElementById('declaration').checked;
    document.getElementById('start-button').style.display = declarationChecked ? 'block' : 'none';
}

// Show questions and start timer
function showQuestions() {
    loadQuestions(selectedSubject);
    document.getElementById('submit-button').style.display = 'block'; // Show submit button only after test starts
    document.getElementById('start-button').style.display = 'none';   // Hide the start button
}

// Load and display questions for selected subject
function loadQuestions(subject) {
    if (subject === 'C Programming') {
        questions = [
            { question: "What is the size of int in C?", options: ["2 bytes", "4 bytes", "8 bytes", "16 bytes"], answer: 1 },
            { question: "Which of the following is a loop structure in C?", options: ["if", "for", "while", "switch"], answer: 2 },
            { question: "What is the output of `printf(\"%d\", 5+3*2);`?", options: ["16", "11", "13", "10"], answer: 2 },
            { question: "Which keyword is used to define a constant in C?", options: ["const", "define", "static", "final"], answer: 0 },
            { question: "Which operator is used to access the value at an address?", options: ["&", "*", "->", "."], answer: 1 },
            { question: "What does the function `strcpy` do in C?", options: ["Copy strings", "Compare strings", "Concatenate strings", "Find string length"], answer: 0 },
            { question: "What is a null pointer in C?", options: ["Pointer to zero", "Pointer with no address", "Pointer to first element", "Invalid pointer"], answer: 1 },
            { question: "What is the result of `10 % 3` in C?", options: ["0", "1", "2", "3"], answer: 2 },
            { question: "Which library function is used to find the length of a string in C?", options: ["strlen()", "strcpy()", "strcmp()", "strcat()"], answer: 0 },
            { question: "Which of the following is a valid variable name in C?", options: ["int$", "1variable", "var_name", "void"], answer: 2 },
        ];
    } else if (subject === 'Data Structures') {
        questions = [
            { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1 },
            { question: "Which data structure is used to implement a stack?", options: ["Array", "Linked List", "Tree", "Graph"], answer: 0 },
            { question: "Which data structure is used to implement a queue?", options: ["Array", "Linked List", "Both", "None"], answer: 2 },
            { question: "What is the best case time complexity of quicksort?", options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"], answer: 1 },
            { question: "Which traversal is used to print binary search trees in sorted order?", options: ["Inorder", "Preorder", "Postorder", "Level-order"], answer: 0 },
            { question: "Which data structure uses LIFO (Last In First Out)?", options: ["Queue", "Stack", "Heap", "Graph"], answer: 1 },
            { question: "How many children does a binary tree node have?", options: ["1", "2", "3", "Any number"], answer: 1 },
            { question: "What is the height of an AVL tree with 7 nodes?", options: ["3", "2", "4", "5"], answer: 0 },
            { question: "Which algorithm is used for finding shortest paths in graphs?", options: ["Prim's", "Dijkstra's", "Kruskal's", "DFS"], answer: 1 },
            { question: "What is a hash table used for?", options: ["Sorting", "Searching", "Mapping keys to values", "Binary search"], answer: 2 },
        ];
    } else if (subject === 'DBMS') {
        questions = [
            { question: "What is the primary key in a database?", options: ["Unique identifier", "Foreign key", "Index", "View"], answer: 0 },
            { question: "Which database management system is widely used?", options: ["MySQL", "PostgreSQL", "Oracle", "Microsoft SQL Server"], answer: 0 },
            { question: "Which language is used to manipulate data in a database?", options: ["DDL", "DML", "DCL", "TCL"], answer: 1 },
            { question: "Which of the following is a NoSQL database?", options: ["MongoDB", "Oracle", "MySQL", "PostgreSQL"], answer: 0 },
            { question: "What is normalization in a database?", options: ["Removing redundancy", "Adding redundancy", "Encrypting data", "Creating indexes"], answer: 0 },
            { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Sequential Query Language", "System Query Language"], answer: 0 },
            { question: "What is a foreign key?", options: ["Unique identifier", "Reference to primary key in another table", "Column with unique values", "Temporary key"], answer: 1 },
            { question: "Which of the following is a DDL command?", options: ["SELECT", "DELETE", "CREATE", "INSERT"], answer: 2 },
            { question: "What is the purpose of an index in a database?", options: ["To increase storage", "To improve query performance", "To encrypt data", "To create tables"], answer: 1 },
            { question: "What is a transaction in DBMS?", options: ["A single unit of work", "A database table", "A user query", "A system call"], answer: 0 },
        ];
    }
    

    const questionsHtml = questions.map((question, index) => {
        return `
            <div class="question">
                <p>${question.question}</p>
                <input type="radio" name="question${index}" value="${question.options[0]}">${question.options[0]}</input><br>
                <input type="radio" name="question${index}" value="${question.options[1]}">${question.options[1]}</input><br>
                <input type="radio" name="question${index}" value="${question.options[2]}">${question.options[2]}</input><br>
                <input type="radio" name="question${index}" value="${question.options[3]}">${question.options[3]}</input>
            </div>
        `;
    }).join('');

    document.getElementById('questions').innerHTML = questionsHtml;
    document.getElementById('questions').style.display = 'block';
    document.getElementById('timer').style.display = 'block';
    startTimer();
}

// Start countdown timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('time').innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft === 0) {
            clearInterval(timer);
            submitTest();
        }
    }, 1000);
}

// Submit the test and calculate score
function submitTest() {
    clearInterval(timer);
    const questionElements = document.querySelectorAll('.question');
    questionElements.forEach((questionElement, index) => {
        const radios = questionElement.querySelectorAll('input[type="radio"]');
        const selectedOption = Array.from(radios).find(radio => radio.checked);
        if (selectedOption && selectedOption.value === questions[index].options[questions[index].answer]) {
            score++;
        }
    });

    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;
    const resultElement = document.getElementById('result');
    resultElement.innerText = `You scored ${score} out of ${totalQuestions}. Percentage: ${percentage}%`;
    resultElement.style.display = 'block';

    // Show "More Mock Tests" button
    document.getElementById('more-tests').style.display = 'block';

    // Disable submit button after submitting
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true;
    submitButton.style.backgroundColor = '#ccc';
}

function goBack(button) {
    const url = button.getAttribute("data-url");
    window.location.href = url;
}

