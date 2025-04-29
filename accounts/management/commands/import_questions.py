from django.core.management.base import BaseCommand
import csv
from accounts.models import Subject, Question

class Command(BaseCommand):
    help = 'Import questions from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']

        with open(csv_file, newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                subject_name = row['Subject']
                subject, created = Subject.objects.get_or_create(name=subject_name)

                Question.objects.create(
                    subject=subject,
                    text=row['Question'],
                    option1=row['Option 1'],
                    option2=row['Option 2'],
                    option3=row['Option 3'] or None,
                    option4=row['Option 4'] or None,
                    correct_option=row['Correct Option'],
                    difficulty=row['Difficulty Level'].capitalize()  # Make sure difficulty matches 'Easy', 'Medium', 'Hard'
                )

        self.stdout.write(self.style.SUCCESS('Questions imported successfully!'))
