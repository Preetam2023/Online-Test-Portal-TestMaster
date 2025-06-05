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
    report_question,
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
    add_test,
    get_questions_by_subject,
    get_random_questions,
    get_questions_by_ids,
    view_tests,
    organization_tests_view,
    start_org_test_view,
    save_test_progress,
    get_test_progress,
    verify_org_test_code,
    submit_org_test_view,
    organization_test_result_view,
    organization_test_history_view,
    edit_test,
    cancel_test,
    test_details,
    generate_question_paper_pdf,
    closed_tests_view,
    export_test_results_excel,
    export_test_results_pdf,
    org_test_results_admin_view,
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
    path('user-dashboard/organization-tests/', organization_tests_view, name='organization_tests'),
    path('user-dashboard/organization-tests/start-org-test/<str:test_code>/', start_org_test_view, name='start_org_test'),
    path('user-dashboard/organization-tests/verify-org-test-code/<int:test_id>/', verify_org_test_code, name='verify_org_test_code'),
    path('user-dashboard/organization-tests/submit-org-test/', submit_org_test_view, name='submit_org_test'),
    path('user-dashboard/organization-tests/result/<int:result_id>/', organization_test_result_view, name='org_test_result'),
    path('user-dashboard/organization-tests/history/', organization_test_history_view, name='org_test_history'),

    path('user-dashboard/mock-test/<str:subject>/', mock_test_page, name='mock_test_page'),
    path('user-dashboard/question-bank/', practice_questions, name='practice_questions'),
    path('user-dashboard/question-bank/<str:subject_name>/', practice_questions, name='practice_questions'),
    path('user-dashboard/question-bank/<str:subject_name>/report-question/', report_question, name='report_question'),

    # Organization Admin
    path('organization-admin-signup/', organization_admin_signup, name='organization-admin-signup'),
    path('organization-admin-login/', admin_login_view, name='organization-admin-login'),
    path('organization-admin-dashboard/', org_admin_dashboard, name='organization-admin-dashboard'),
    path('organization/settings/', organization_settings, name='organization-settings'),
    path('organization/change-password/', change_password, name='change-password'),
    path('organization/moderators/', control_moderators, name='control-moderators'),
    path('organization/moderators/delete/<int:moderator_id>/', delete_moderator, name='delete-moderator'),
    path('organization/moderators/toggle-status/<int:moderator_id>/', toggle_moderator_status, name='toggle-moderator-status'),
    path('organization/add-test/', add_test, name='add-test'),
    path('organization/view-tests/', view_tests, name='view-tests'),
    path('organization/view-tests/test-details/<int:test_id>/', test_details, name='test_details'),
    path('organization/view-tests/test-details/<int:test_id>/pdf/', generate_question_paper_pdf, name='question_paper_pdf'),
    path('organization/view-tests/edit-test/<int:test_id>/', edit_test, name='edit_test'),
    path('organization/view-tests/cancel-test/<int:test_id>/', cancel_test, name='cancel_test'),
    path('organization/closed-tests/', closed_tests_view, name='closed_tests'),
    path('organization/closed-tests/results/<int:test_id>/', org_test_results_admin_view, name='admin_test_results'),
    path('organization/closed-tests/results/<int:test_id>/excel/', export_test_results_excel, name='export_results_excel'),
    path('organization/closed-tests/results/<int:test_id>/pdf/', export_test_results_pdf, name='export_results_pdf'),



    # API endpoints for dynamic question loading
    path('api/get-random-questions/<int:subject_id>/', get_random_questions, name='get-random-questions'),
    path('api/get-questions/<int:subject_id>/', get_questions_by_subject, name='get-questions-by-subject'),
    path('api/get-questions-by-ids/', get_questions_by_ids, name='get-questions-by-ids'),

    #Test Data save and fetch
    path('save-progress/', save_test_progress, name='save_progress'),
    path('load-progress/<int:test_id>/', get_test_progress, name='load_progress'),


    # Moderator
    path('moderator/login/', moderator_login, name='moderator-login'),
    path('moderator/dashboard/', moderator_dashboard, name='moderator-dashboard'),
]
