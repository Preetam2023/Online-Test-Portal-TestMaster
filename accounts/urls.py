from django.urls import path
from .views import home, login_view, user_signup,user_dashboard,user_profile,organization_admin_signup, admin_login_view, test_dashboard,practice_questions
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
]
