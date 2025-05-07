
from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
from django.contrib import messages
from .forms import LoginForm, SignupForm
from django.contrib.auth.decorators import login_required
from .models import User
from django.shortcuts import render, redirect

from django.contrib.auth import login
from .forms import LoginForm

import requests
from django.http import JsonResponse

import json
import requests
from django.http import JsonResponse

User = get_user_model()  

def home(request):
    return render(request, 'accounts/home.html')

def about(request):
    return render(request, 'accounts/about.html')
def contact(request):
    return render(request, 'accounts/contact.html')

def user_signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Registration successful. You can now log in.')
            login(request, user)
            return redirect('user_dashboard')
        else:
            print(form.errors)  # 👉 Add this line to debug

    else:
        form = SignupForm()

    return render(request, 'accounts/user_signup.html', {'form': form})


from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import render, redirect
from .forms import LoginForm

User = get_user_model()  # Dynamically get the custom user model

from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import render, redirect
from .forms import LoginForm

User = get_user_model()  # Dynamically get the custom user model

# accounts/views.py

from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import render, redirect
from .forms import LoginForm

User = get_user_model()

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            print(f"Authenticating with email: {email}")

            user = authenticate(request, email=email, password=password)

            if user is not None:
                login(request, user)
                print("Authentication successful")
                return redirect('user_dashboard')
            else:
                print("Authentication failed")
                form.add_error(None, "Invalid email or password.")
    else:
        form = LoginForm()

    context = {'form': form}
    return render(request, 'accounts/user_login.html', context)




from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Organization, OrganizationTest

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Organization, OrganizationTest

@login_required
def user_dashboard(request):
    user = request.user
    
    if request.method == 'POST':
        # Check if form fields are present
        org_name = request.POST.get('organization_name')
        user_id = request.POST.get('user_id')
        
        if not org_name or not user_id:
            messages.error(request, "Please fill in both the Organization Name and User ID.")
            return render(request, 'accounts/user_dashboard.html', {'user': user})

        org_name = org_name.strip().lower()  # Safely apply strip() after checking for None
        user_id = user_id.strip()  # Same for user_id

        # Query organization and tests based on form data
        try:
            organization = Organization.objects.get(name__iexact=org_name)
            tests = OrganizationTest.objects.filter(organization=organization, is_cancelled=False)

            if tests.exists():
                # Render the page with the tests found for the organization
                return render(request, 'accounts/user_dashboard.html', {'user': user, 'organization': organization, 'tests': tests})
            else:
                # If no tests are found, show a message
                messages.error(request, "No tests available for this organization.")
                return render(request, 'accounts/user_dashboard.html', {'user': user, 'organization_name': org_name, 'user_id': user_id})

        except Organization.DoesNotExist:
            messages.error(request, f"No organization named '{org_name}' found.")
            return render(request, 'accounts/user_dashboard.html', {'user': user, 'organization_name': org_name, 'user_id': user_id})

    else:
        return render(request, 'accounts/user_dashboard.html', {'user': user})



@login_required
def user_profile(request):
    
    test_history = []  # Placeholder for future test history data
    return render(request, 'accounts/user_profile.html', {
        'user': request.user,
        'test_history': test_history
    })


from django.shortcuts import render, get_object_or_404
from .models import Subject, Question
from django.db.models import Count
import random

@login_required
def practice_questions(request, subject_name=None):
    subjects = Subject.objects.all()

    selected_subject = None
    questions = None
    if subject_name:
        selected_subject = get_object_or_404(Subject, name=subject_name)
        all_questions = list(Question.objects.filter(subject=selected_subject))
        questions = random.sample(all_questions, min(30, len(all_questions)))  # Pick 30 or less if not enough

    return render(request, 'accounts/practice_questions.html', {
        'subjects': subjects,
        'selected_subject': selected_subject,
        'questions': questions,
    })

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Question, QuestionReport

@csrf_exempt
def report_question(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        question_id = data.get('question_id')
        reason = data.get('reason')
        question = Question.objects.get(id=question_id)

        QuestionReport.objects.create(
            question=question,
            user=request.user if request.user.is_authenticated else None,
            reason=reason
        )
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)







from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .forms import OrganizationLoginForm

def admin_login_view(request):
    if request.method == 'POST':
        form = OrganizationLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            
            # Authenticate using email as username
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                # Check if user has organization admin profile
                if hasattr(user, 'org_admin_profile'):
                    login(request, user)
                    # Redirect to organization admin dashboard
                    return redirect('organization-admin-dashboard')
                else:
                    messages.error(request, 'This account is not authorized as an organization admin')
            else:
                messages.error(request, 'Invalid email or password')
        else:
            messages.error(request, 'Please correct the errors below')
    else:
        form = OrganizationLoginForm()
    
    return render(request, 'accounts/org_admin_login.html', {'form': form})


@login_required
def run_code(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # Parse JSON data
            code = data.get('code')
            language = data.get('language')
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        if not code or not language:
            return JsonResponse({"error": "Code or language not provided."}, status=400)

        # JDoodle API endpoint
        api_url = "https://api.jdoodle.com/v1/execute"

        # Mapping language to versionIndex (for supported languages)
        version_map = {
            "c": "5",  # C version index on JDoodle
            "java": "4",  # Java version index on JDoodle
            "python3": "5"  # Python version index on JDoodle
        }

        # Check if the language is supported
        if language not in version_map:
            return JsonResponse({"error": "Unsupported language"}, status=400)

        # Prepare data for the API
        data = {
            "script": code,
            "language": language,
            "versionIndex": version_map[language],
            "clientId": "a39a07ed1a877a291386df8269ba78d2",  # Replace with your JDoodle clientId
            "clientSecret": "b3a4bafd1db367f11aad3baada1120cdd3d5bd26ea2887b8643545418d16740e"  # Replace with your JDoodle clientSecret
        }

        # Send code to the JDoodle API
        try:
            response = requests.post(api_url, json=data, headers={"Content-Type": "application/json"})
            print("Response status code:", response.status_code)
            print("Response content:", response.text)

            if response.status_code != 200:
                return JsonResponse({"error": "Error from JDoodle API: " + response.text}, status=response.status_code)

            result = response.json()
            print("Result from JDoodle:", result)
            if 'output' in result:
                print("Output:", result['output'])
            else:
                print("No output returned.")

            return JsonResponse(result)
        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": str(e)}, status=500)
        
from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from accounts.models import Subject, Question
import random


@login_required
def mock_test(request):
    subjects = Subject.objects.all()
    return render(request, 'accounts/mock_test.html', {'subjects': subjects})

@login_required
def mock_test_page(request, subject):
    subject_obj = get_object_or_404(Subject, name=subject)
    questions = list(Question.objects.filter(subject=subject_obj))
    selected_questions = random.sample(questions, min(15, len(questions)))  # 15 or less

    return render(request, 'accounts/mock_test_page.html', {
        'subject': subject_obj,
        'questions': selected_questions
    })


@login_required
def submit_test(request):
    # Handle submission logic here
    return HttpResponse('Test submitted!')


from django.contrib.auth import logout
from django.shortcuts import redirect

def custom_logout(request):
    logout(request)
    return redirect('home')  # Redirect to home after logout


from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from .forms import OrganizationSignupForm, OrganizationLoginForm
from .models import Organization 

# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import OrganizationSignupForm
from django.contrib import messages

def organization_admin_signup(request):
    if request.method == 'POST':
        form = OrganizationSignupForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Organization registration successful!')
            return redirect('organization-admin-dashboard')  # Replace with your dashboard URL
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = OrganizationSignupForm()
    
    return render(request, 'accounts/org_admin_signup.html', {'form': form})


# views.py
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from .forms import (OrganizationSignupForm, OrganizationLoginForm, 
                   OrganizationSettingsForm, AddModeratorForm,
                   PasswordChangeForm, ModeratorLoginForm)
from .models import Organization, ModeratorProfile
import random
import string

@login_required
def org_admin_dashboard(request):
    if not hasattr(request.user, 'org_admin_profile'):
        return redirect('organization-admin-login')
    
    organization = request.user.org_admin_profile.organization
    moderators = ModeratorProfile.objects.filter(organization=organization)
    
    context = {
        'organization': organization,
        'moderators': moderators,
    }
    return render(request, 'accounts/org_admin_dashboard.html', context)

@login_required
def organization_settings(request):
    if not hasattr(request.user, 'org_admin_profile'):
        return redirect('organization-admin-login')
    
    organization = request.user.org_admin_profile.organization
    
    if request.method == 'POST':
        form = OrganizationSettingsForm(request.POST, request.FILES, instance=organization)
        if form.is_valid():
            form.save()
            messages.success(request, 'Organization settings updated successfully!')
            return redirect('organization-settings')
    else:
        form = OrganizationSettingsForm(instance=organization)
    
    return render(request, 'accounts/org_settings.html', {
        'form': form,
        'organization': organization,
        'active_page': 'settings', 
    })

from django.http import JsonResponse
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important to keep user logged in
            return JsonResponse({'success': True})
        else:
            errors = form.errors.as_json()
            return JsonResponse({'success': False, 'error': errors})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

from django.core.mail import send_mail
from django.conf import settings

from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import ModeratorProfile
from .forms import AddModeratorForm
import random
import string
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@login_required
def control_moderators(request):
    if not hasattr(request.user, 'org_admin_profile'):
        return redirect('organization-admin-login')
    
    organization = request.user.org_admin_profile.organization
    moderators = ModeratorProfile.objects.filter(organization=organization)
    
    if request.method == 'POST':
        form = AddModeratorForm(request.POST)
        if form.is_valid():
            full_name = form.cleaned_data['full_name']
            email = form.cleaned_data['email']
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            
            try:
                # Create user
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    role=User.Role.MODERATOR
                )
                
                # Create moderator profile
                moderator = ModeratorProfile.objects.create(
                    user=user,
                    organization=organization,
                    added_by=request.user,
                    full_name=full_name
                )
                
                # Prepare email content
                email_context = {
                    'moderator_name': full_name,
                    'organization_name': organization.name,
                    'email': email,
                    'password': password,
                    'login_url': request.build_absolute_uri('accounts/moderator/login/')
                }
                
                # Render HTML email template
                html_message = render_to_string('accounts/email/moderator_welcome.html', email_context)
                plain_message = strip_tags(html_message)
                
                # Send email
                try:
                    send_mail(
                        subject=f'Welcome to {organization.name} as Moderator',
                        message=plain_message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        html_message=html_message,
                        fail_silently=False
                    )
                    email_status = "Email sent successfully"
                except Exception as e:
                    logger.error(f"Failed to send email to {email}: {str(e)}")
                    email_status = "Email failed to send"
                
                messages.success(request, 
                    f'Moderator "{full_name}" added successfully!<br>'
                    f'<strong>Email:</strong> {email}<br>'
                    f'<strong>Password:</strong> {password}<br>'
                    f'<strong>Email Status:</strong> {email_status}'
                )
                return redirect('control-moderators')
                
            except Exception as e:
                messages.error(request, f'Error creating moderator: {str(e)}')
    else:
        form = AddModeratorForm()
    
    context = {
        'form': form,
        'moderators': moderators,
    }
    return render(request, 'accounts/control_moderators.html', context)

@login_required
def delete_moderator(request, moderator_id):
    if not hasattr(request.user, 'org_admin_profile'):
        return redirect('organization-admin-login')
    
    moderator = get_object_or_404(ModeratorProfile, id=moderator_id, organization=request.user.org_admin_profile.organization)
    user = moderator.user
    moderator.delete()
    user.delete()
    
    messages.success(request, 'Moderator deleted successfully!')
    return redirect('control-moderators')

@login_required
def toggle_moderator_status(request, moderator_id):
    if not hasattr(request.user, 'org_admin_profile'):
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    
    moderator = get_object_or_404(ModeratorProfile, id=moderator_id, organization=request.user.org_admin_profile.organization)
    moderator.user.is_active = not moderator.user.is_active
    moderator.user.save()
    
    return JsonResponse({
        'success': True,
        'is_active': moderator.user.is_active,
        'message': f'Moderator {"activated" if moderator.user.is_active else "deactivated"} successfully'
    })
    
    
def moderator_login(request):
    if request.method == 'POST':
        form = ModeratorLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)
            
            if user is not None and hasattr(user, 'moderator_profile'):
                login(request, user)
                return redirect('moderator-dashboard')
            else:
                messages.error(request, 'Invalid email or password')
    else:
        form = ModeratorLoginForm()
    
    return render(request, 'accounts/moderator_login.html', {'form': form})

from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render, redirect
from .forms import AddTestForm
from .models import TestQuestion, Question, OrganizationTest

from .models import Subject  # Add if not already imported
from django.contrib import messages

# views.py
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Subject, Question, TestQuestion, OrganizationTest
from .forms import AddTestForm
def is_org_admin_or_moderator(user):
    return user.is_authenticated and user.role in ['ORG_ADMIN', 'MODERATOR']
@login_required
@user_passes_test(is_org_admin_or_moderator)


def add_test(request):
    subjects = Subject.objects.all()

    if request.method == 'POST':
        form = AddTestForm(request.POST)

        if form.is_valid():
            test = form.save(commit=False)
            test.organization = request.user.org_admin_profile.organization
            test.created_by = request.user

            # Handle subject selection or new subject creation
            subject_id = request.POST.get('subject')
            subject_name = request.POST.get('subject_name')

            if subject_id and subject_id != "new":
                try:
                    test.subject = Subject.objects.get(id=subject_id)
                except Subject.DoesNotExist:
                    messages.error(request, "Selected subject not found.")
                    return redirect('add-test')
            elif subject_name:
                new_subject, created = Subject.objects.get_or_create(name=subject_name.strip())
                test.subject = new_subject
            else:
                messages.error(request, "Please select a subject or enter a new one.")
                return redirect('add-test')

            test.save()

            # Handle selected questions
            selected_ids = request.POST.getlist('selected_questions')
            if selected_ids:
                for qid in selected_ids:
                    try:
                        question = Question.objects.get(id=qid)
                        TestQuestion.objects.create(test=test, question=question)
                    except Question.DoesNotExist:
                        continue

            messages.success(
                request,
                f"Test added successfully!<br>Test Name: <strong>{test.title}</strong><br>Test Password: <strong>{test.test_code}</strong>",
                extra_tags='admin')

            return redirect('view-tests')

        else:
            messages.error(request, "Failed to add test. Please correct the errors below.", extra_tags='admin')

    else:
        form = AddTestForm()

    return render(request, 'accounts/add_test.html', {
        'form': form,
        'subjects': subjects,
    })




from django.http import JsonResponse
from .models import Question
import random
import json

@login_required
@user_passes_test(is_org_admin_or_moderator)
def get_random_questions(request, subject_id):
    count = int(request.GET.get('count', 0))
    questions = list(Question.objects.filter(subject_id=subject_id))
    selected = random.sample(questions, min(count, len(questions)))

    return JsonResponse({
        'questions': [{
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
        } for q in selected]
    })


@login_required
@user_passes_test(is_org_admin_or_moderator)
def get_questions_by_subject(request, subject_id):
    questions = Question.objects.filter(subject_id=subject_id)
    return JsonResponse({
        'questions': [{
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
        } for q in questions]
    })


@login_required
@user_passes_test(is_org_admin_or_moderator)
def get_questions_by_ids(request):
    data = json.loads(request.body)
    ids = data.get('ids', [])
    questions = Question.objects.filter(id__in=ids)
    return JsonResponse({
        'questions': [{
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
        } for q in questions]
    })

from .models import OrganizationTest

def view_tests(request):
    tests = OrganizationTest.objects.filter(
        organization=request.user.org_admin_profile.organization,
        is_cancelled=False 
    ).order_by('-date_created')
    return render(request, 'accounts/view_tests.html', {'tests': tests})




from django.shortcuts import render, redirect
from django.urls import reverse  # Add this import
from django.contrib.auth.decorators import login_required
from .models import Organization, OrganizationTest
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import Organization, OrganizationTest
from django.db.models import Q
from django.contrib import messages


@login_required

def organization_tests_view(request):
    user = request.user

    if request.method == 'POST':
        org_name = request.POST.get('organization_name', '').strip()
        user_id = request.POST.get('user_id', '').strip()

        if not org_name or not user_id:
            messages.error(request, "Please fill in both fields.", extra_tags='org_test')
            return redirect('user_dashboard')

        try:
            organization = Organization.objects.get(name__iexact=org_name)
            tests = OrganizationTest.objects.filter(organization=organization, is_cancelled=False)


            if tests.exists():
                return render(request, 'accounts/org_test_list.html', {
                    'organization': organization,
                    'tests': tests,
                })
            else:
                # No tests found, show a message
                messages.error(request, f"No tests found for the organization '{org_name}'.", extra_tags='org_test')
                return redirect('user_dashboard')

        except Organization.DoesNotExist:
            messages.error(request, f"No organization named '{org_name}' found.", extra_tags='org_test')
            return redirect('user_dashboard')

    # If not POST, fallback to user dashboard
    return redirect('user_dashboard')

# views.py
def edit_test(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)

    if request.method == 'POST':
        test.title = request.POST.get('title')
        test.test_code = request.POST.get('test_code')
        test.total_questions = request.POST.get('total_questions')
        # Update subject if changed
        subject_id = request.POST.get('subject')
        test.subject_id = subject_id
        test.save()
        messages.success(request, "Test updated successfully.", extra_tags='admin')
        return redirect('view-tests')

    subjects = Subject.objects.all()
    return render(request, 'accounts/edit_test.html', {'test': test, 'subjects': subjects})

from django.utils import timezone

def cancel_test(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)
    test.is_cancelled = True
    test.cancelled_by = request.user
    test.cancelled_at = timezone.now()
    test.save()
    messages.success(request, f"Test '{test.title}' has been canceled.", extra_tags='admin')
    return redirect('view-tests')

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import OrganizationTest

@login_required
def closed_tests_view(request):
    closed_tests = OrganizationTest.objects.filter(
        is_cancelled=True
    ).select_related('subject', 'created_by', 'cancelled_by')

    return render(request, 'accounts/closed_tests.html', {
        'tests': closed_tests
    })





@login_required
def start_org_test_view(request, test_code):
    try:
        test = OrganizationTest.objects.get(test_code=test_code)
        test_questions = TestQuestion.objects.filter(test=test).select_related('question')
        return render(request, 'accounts/org_test_page.html', {
            'test': test,
            'test_questions': test_questions
        })
    except OrganizationTest.DoesNotExist:
        return redirect(reverse('organization_tests'))

# accounts/views.py

from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def submit_org_test_view(request):
    if request.method == "POST":
        # Placeholder logic
        return render(request, 'org_test_submitted.html')
    else:
        return redirect('dashboard')  # or some fallback


from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import OrganizationTest  # or your relevant modelfrom django.shortcuts import redirect, get_object_or_404
from django.contrib import messages

def verify_org_test_code(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)

    if request.method == 'POST':
        entered_code = request.POST.get('test_code', '').strip()

        if entered_code == test.test_code:
            return redirect('start_org_test', test_code=test.test_code)
        else:
            
            messages.error(request, "❌ Incorrect test code. Please try again.")
            
            # Get all tests and the organization again
            all_tests = OrganizationTest.objects.filter(organization=test.organization)
            organization = test.organization

            return render(request, 'accounts/org_test_list.html', {
                'tests': all_tests,
                'organization': organization,
            })




    
    

@login_required
def moderator_dashboard(request):
    if not hasattr(request.user, 'moderator_profile'):
        return redirect('moderator-login')
    
    # Add moderator dashboard logic here
    return render(request, 'accounts/moderator_dashboard.html')