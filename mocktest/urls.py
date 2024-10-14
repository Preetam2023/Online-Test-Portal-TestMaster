# mocktest/urls.py

from django.urls import path
from .views import available_tests, start_test, submit_test

urlpatterns = [
    path('', available_tests, name='available_tests'),  # Redirects to available tests
    path('start/<int:test_id>/', start_test, name='start_test'),  # Redirects to the start test page
    path('submit/<int:test_id>/', submit_test, name='submit_test'),  # Redirects to submit test page
]
