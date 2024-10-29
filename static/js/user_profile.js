// Array of quotes
const quotes = [
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
];

// Function to display a random quote
function displayQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById("quote").innerHTML = `<span>"${quote.text}"</span> - ${quote.author}`;
}

// Display a quote initially
displayQuote();

// Display a new quote every 10 seconds
setInterval(displayQuote, 10000);
