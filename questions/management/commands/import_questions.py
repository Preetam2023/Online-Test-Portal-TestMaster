import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from questions.models import QuestionBank  # Ensure you have the correct model imported

class Command(BaseCommand):
    help = 'Import questions from specified URLs'

    def handle(self, *args, **kwargs):
        urls = {
            'C': 'https://www.sanfoundry.com/c-interview-questions-answers/',
            'Data Structure': 'https://www.sanfoundry.com/1000-data-structure-questions-answers/',
        }

        for subject, url in urls.items():
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Adjust based on actual HTML structure
            questions = soup.find_all('div', class_='question')  # Verify this class name
            
            for index, question in enumerate(questions):
                question_text = question.find('p', class_='question-text').text.strip()  # Adjust as necessary
                options = [option.text.strip() for option in question.find_all('li')]  # Ensure this matches the site's HTML structure
                
                # Logic to determine the correct answer might need to be adjusted
                correct_answer = options[0] if options else None
                
                # Create the question entry in the database
                QuestionBank.objects.create(
                    subject=subject,
                    question_no=index + 1,
                    question_text=question_text,
                    options=options,
                    correct_answer=correct_answer,
                )
                print(f'Imported Question: {question_text}')  # Debugging output
