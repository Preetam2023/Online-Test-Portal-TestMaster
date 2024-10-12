
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import render, redirect
from .forms import QuestionForm
# accounts/views.py
from questions.models import Subject, Question  # Change this line

@user_passes_test(lambda u: u.is_superuser)
def add_question(request):
    if request.method == "POST":
        form = QuestionForm(request.POST)
        if form.is_valid():
            question = form.save(commit=False)
            
            # Collect the options from the form
            options = [
                request.POST.get('option_1'),
                request.POST.get('option_2'),
                request.POST.get('option_3'),
                request.POST.get('option_4')
            ]

            # Filter out any empty values
            options = [opt for opt in options if opt]

            question.options = options  # Save the options list to the JSONField
            question.save()

            return redirect('questions:question_list')  # Redirect after saving the question
    else:
        form = QuestionForm()
    
    return render(request, 'questions/add_question.html', {'form': form})



def question_list(request):
    questions = Question.objects.all()
    return render(request, 'questions/question_list.html', {'questions': questions})

from django.shortcuts import render, get_object_or_404
from .models import Subject, Question

# In views.py
def subject_questions(request, subject_id):
    subject = get_object_or_404(Subject, id=subject_id)
    questions = Question.objects.filter(subject=subject)
    
     # Debug: Check options being passed
    for question in questions:
        print(question.options)  # This should print the options list for each question

    
    if request.method == "POST":
        results = []
        for question in questions:
            selected_answer = request.POST.get('answer_' + str(question.id))
            is_correct = selected_answer == question.correct_answer
            results.append((question, is_correct))
        
        return render(request, 'questions/subject_questions.html', {
            'subject': subject,
            'questions': questions,
            'results': results,
        })

    return render(request, 'questions/subject_questions.html', {
        'subject': subject,
        'questions': questions,
    })
