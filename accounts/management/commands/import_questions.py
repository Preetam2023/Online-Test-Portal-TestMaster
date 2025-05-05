from django.core.management.base import BaseCommand
from accounts.models import Subject, Question
import pandas as pd

class Command(BaseCommand):
    help = 'Import questions from a public Google Sheet'

    def add_arguments(self, parser):
        parser.add_argument('sheet_id', type=str, help='Google Sheet ID')

    def handle(self, *args, **kwargs):
        sheet_id = kwargs['sheet_id']
        csv_url = f'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRohvLkMYZHWWtYfJ6C_dM-gCetz0WVotLxudQriMzbap6ek3UhChuRIjnpeP1LpoGx0N6aeV-8uq3/pub?output=csv'

        try:
            df = pd.read_csv(csv_url)

            for index, row in df.iterrows():
                qid = row['QID'].strip()

                # Skip if question with this QID already exists
                if Question.objects.filter(qid=qid).exists():
                    self.stdout.write(self.style.WARNING(f"Skipped: QID '{qid}' already exists."))
                    continue

                subject_name = row['Subject'].strip()
                subject, _ = Subject.objects.get_or_create(name=subject_name)

                Question.objects.create(
                    subject=subject,
                    qid=qid,
                    text=row['Question'],
                    option1=row['Option 1'],
                    option2=row['Option 2'],
                    option3=row.get('Option 3') or None,
                    option4=row.get('Option 4') or None,
                    correct_option=row['Correct Option'],
                    difficulty=row['Difficulty Level'].capitalize()
                )

            self.stdout.write(self.style.SUCCESS('Questions imported successfully from Google Sheet!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to import: {e}"))
