# questions/models.py
from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

from django.db import models

class Question(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    question_text = models.TextField()
    options = models.JSONField(default=list)     
    correct_answer = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10)


    def __str__(self):
        return self.question_text
