function startTest(button, subject) {
    const url = button.getAttribute("data-url");
    window.location.href = `${url}?subject=${subject}`;
}
