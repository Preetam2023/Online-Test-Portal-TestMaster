# mocktest/models.py

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings  # Import settings to use AUTH_USER_MODEL

class MockTest(models.Model):
    test_name = models.CharField(max_length=200,default='Default Test')
    duration = models.PositiveIntegerField(default=60)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.test_name

class Question(models.Model):
    mock_test = models.ForeignKey(MockTest, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=[('MCQ', 'Multiple Choice'), ('TEXT', 'Text Input')])
    correct_answer = models.TextField()

    def __str__(self):
        return self.question_text

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=200)

    def __str__(self):
        return self.option_text
