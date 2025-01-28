from django.urls import path
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views 

from .views import (
    home,
    login_view,
    user_signup,
    user_dashboard,
    user_profile,
    organization_admin_signup,
    admin_login_view,
    test_dashboard,
    run_code,
    practice_questions,
    mock_test,
    mock_test_page,
    custom_logout,
)

urlpatterns = [
    path('', home, name='home'),  
    path('user-signup/', user_signup, name='user_signup'),
    path('user-login/', login_view, name='user_login'),
    path('user-dashboard/', user_dashboard, name='user_dashboard'),
    path('user-dashboard/profile/', user_profile, name='profile'),
    path('user-dashboard/code-editor/', TemplateView.as_view(template_name='accounts/code_editor.html'), name='code_editor'),
    path('user-dashboard/code-editor/run-code/', run_code, name='run_code'),
    path('user-dashboard/mock-test/', mock_test, name='mock_test'),
    path('user-dashboard/mock-test/mock-test-page/', mock_test_page, name='mock_test_page'),
    path('user-dashboard/question-bank/', practice_questions, name='practice_questions'),

    path('organization-admin-signup/', organization_admin_signup, name='organization-admin-signup'),
    path('organization-admin-login/', admin_login_view, name='organization-admin-login'),
    path('organization-admin-dashboard/', test_dashboard, name='admin-dashboard'),

    path('logout/', custom_logout, name='custom_logout'),  
]