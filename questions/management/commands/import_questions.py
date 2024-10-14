import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from questions.models import QuestionBank

class Command(BaseCommand):
    help = 'Import questions from specified URLs'

    def handle(self, *args, **kwargs):
        urls = {
            'C': 'https://www.sanfoundry.com/c-interview-questions-answers/',
        }

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
        }

        print("Starting to import questions...")

        for subject, url in urls.items():
            response = requests.get(url, headers=headers)

            if response.status_code != 200:
                print(f"Failed to fetch URL: {url}, Status code: {response.status_code}")
                continue

            soup = BeautifulSoup(response.content, 'html.parser')

            # Locate the main section containing the questions
            question_blocks = soup.find_all('div', class_='entry-content')

            if not question_blocks:
                print(f"No question blocks found for URL: {url}")
                continue

            for index, question_block in enumerate(question_blocks):
                # Print the content of the question block for debugging
                print(f"Question Block {index + 1} HTML: {question_block.prettify()}")

                # Extract the question text
                question_text_tag = question_block.find('p')  # Modify this line based on the actual HTML structure

                if question_text_tag:
                    question_text = question_text_tag.get_text(strip=True)
                else:
                    question_text = "No question text"

                # Now find all options, assuming they're in <li> tags
                options = []
                option_tags = question_block.find_all('li')  # Adjust this based on actual HTML structure
                for li in option_tags:
                    option_text = li.get_text(strip=True)
                    if option_text:  # Only add non-empty options
                        options.append(option_text)

                # Check for answer block
                answer_block = question_block.find('div', class_='collapseomatic_content')
                if answer_block:
                    answer_text = answer_block.text.strip()
                    correct_answer = answer_text.split(':')[1].strip()[0]  # Assuming 'Answer: c' format
                else:
                    correct_answer = None

                # Create a dictionary for options, ensure you have exactly 4 options
                options_dict = {
                    'a': options[0] if len(options) > 0 else None,
                    'b': options[1] if len(options) > 1 else None,
                    'c': options[2] if len(options) > 2 else None,
                    'd': options[3] if len(options) > 3 else None,
                }

                print(f"Extracted Question: {question_text}")
                print(f"Extracted Options: {options_dict}")
                print(f"Extracted Correct Answer: {correct_answer}")

                # Create the question in the database
                question_obj = QuestionBank.objects.create(
                    subject=subject,
                    question_no=index + 1,
                    question_text=question_text,
                    options=options_dict,  # Save options as a dictionary
                    correct_answer=correct_answer if correct_answer else "Unknown"
                )

                if question_obj:
                    print(f"Question {index + 1} saved to the database.")
                else:
                    print(f"Failed to save Question {index + 1}.")

        print("Question import process completed.")
