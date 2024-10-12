from django.urls import path
from .views import add_question, question_list,subject_questions

app_name = 'questions'

urlpatterns = [
    path('add/', add_question, name='add_question'),
    path('list/', question_list, name='question_list'),
     path('subject/<int:subject_id>/questions/', subject_questions, name='subject_questions'),
]
