from django.urls import path
from django.views.generic import TemplateView

from .views import home, login_view, user_signup,user_dashboard,user_profile,organization_admin_signup, admin_login_view, test_dashboard,run_code, practice_questions
urlpatterns = [
    path('', home, name='home'),
    path('user-signup/', user_signup, name='user_signup'),
    path('user-login/', login_view, name='user_login'),
    path('user-dashboard/',user_dashboard, name='user_dashboard'),
    path('profile/', user_profile, name='profile'),
    path('organization-admin-signup/', organization_admin_signup, name='organization-admin-signup'),
    path('organization-admin-login/', admin_login_view, name='organization-admin-login'),
    path('practice-questions/', practice_questions, name='practice_questions'),
    path('organization-admin-dashboard/', test_dashboard, name='dashboard'),
    
     path('code-editor/', TemplateView.as_view(template_name='accounts/code_editor.html'), name='code_editor'),
    path('run-code/', run_code, name='run_code'),
]
