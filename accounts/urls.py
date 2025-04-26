from django.urls import path
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views 
from .views import (
    home, login_view,
    user_signup,
    user_dashboard,
    user_profile,
    organization_admin_signup,
    admin_login_view,
    run_code,
    practice_questions,
    mock_test,
    mock_test_page,
    custom_logout,
    org_admin_dashboard,
    about,
    contact,
    organization_settings,
    change_password,
    control_moderators,
    delete_moderator,
    moderator_login,
    moderator_dashboard,
    toggle_moderator_status,
)

urlpatterns = [
    # Public Pages
    path('', home, name='home'),  
    path('user-signup/', user_signup, name='user_signup'),
    path('user-login/', login_view, name='user_login'),
    path('about-us/', about, name='about'),
    path('contact/', contact, name='contact'),
    path('logout/', custom_logout, name='custom_logout'),

    # User Dashboard
    path('user-dashboard/', user_dashboard, name='user_dashboard'),
    path('user-dashboard/profile/', user_profile, name='profile'),
    path('user-dashboard/code-editor/', TemplateView.as_view(template_name='accounts/code_editor.html'), name='code_editor'),
    path('user-dashboard/code-editor/run-code/', run_code, name='run_code'),
    path('user-dashboard/mock-test/', mock_test, name='mock_test'),
    path('user-dashboard/mock-test/mock-test-page/', mock_test_page, name='mock_test_page'),
    path('user-dashboard/question-bank/', practice_questions, name='practice_questions'),

    # Organization Admin
    path('organization-admin-signup/', organization_admin_signup, name='organization-admin-signup'),
    path('organization-admin-login/', admin_login_view, name='organization-admin-login'),
    path('organization-admin-dashboard/', org_admin_dashboard, name='organization-admin-dashboard'),
    path('organization/settings/', organization_settings, name='organization-settings'),
    path('organization/change-password/', change_password, name='change-password'),
    path('organization/moderators/', control_moderators, name='control-moderators'),
    path('organization/moderators/delete/<int:moderator_id>/', delete_moderator, name='delete-moderator'),
    path('organization/moderators/toggle-status/<int:moderator_id>/', toggle_moderator_status, name='toggle-moderator-status'),

    # Moderator
    path('moderator/login/', moderator_login, name='moderator-login'),
    path('moderator/dashboard/', moderator_dashboard, name='moderator-dashboard'),
]
