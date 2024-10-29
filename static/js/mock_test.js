function startTest(subject) {
    window.location.href = "{% url 'mock_test_page' %}?subject=" + subject;  // Pass the subject
}
