from django.contrib import admin
from .models import Subject, Question,QuestionBank

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'subject', 'difficulty')

admin.site.register(QuestionBank)
