import requests
from bs4 import BeautifulSoup

url = "https://www.sanfoundry.com/computer-science-questions-answers/#mcq-core-computer-science-subjects"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find subjects and their corresponding questions
subjects = soup.find_all('h2')  # Assuming each subject is in an <h2> tag
for subject in subjects:
    print(subject.text)  # Subject name
    questions = subject.find_next('ul')  # Assuming questions follow in a <ul> tag
    for question in questions.find_all('li'):
        print(question.text)  # Each question
