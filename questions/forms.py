from django import forms
from .models import Question

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['subject', 'question_text','correct_answer', 'difficulty']

    options = forms.CharField(widget=forms.Textarea, help_text="Enter options separated by commas.")
