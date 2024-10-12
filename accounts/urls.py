from django.urls import path
from .views import home, login_view, signup,dashboard,profile, practice_questions,mock_test
urlpatterns = [
    path('', home, name='home'),
    path('signup/', signup, name='signup'),
    path('login/', login_view, name='login'),
    path('dashboard/', dashboard, name='dashboard'),
    path('profile/', profile, name='profile'),
    path('practice-questions/', practice_questions, name='practice_questions'), 
    path('mock-test/', mock_test, name='mock_test'),
]
