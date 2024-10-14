# mocktest/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import MockTest, Question
from django.utils import timezone
from django.http import JsonResponse

@login_required
def available_tests(request):
    tests = MockTest.objects.all()
    return render(request, 'mocktest/available_tests.html', {'tests': tests})

@login_required
def start_test(request, test_id):
    mock_test = get_object_or_404(MockTest, id=test_id)
    questions = mock_test.questions.all()
    return render(request, 'mocktest/start_test.html', {'mock_test': mock_test, 'questions': questions})

@login_required
def submit_test(request, test_id):
    if request.method == 'POST':
        # Logic to handle test submission and scoring
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'})
