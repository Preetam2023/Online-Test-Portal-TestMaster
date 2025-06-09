
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


from django.contrib import messages
from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import render, redirect
from .forms import LoginForm

User = get_user_model()

def login_view(request):
    form = LoginForm(request.POST or None)

    # Show warning message if redirected from login_required
    if request.method == 'GET' and 'next' in request.GET:
        messages.warning(request, "⚠️ You must be logged in to access this page.")

    if request.method == 'POST':
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)

            if user is not None:
                login(request, user)
                return redirect(request.GET.get('next') or 'user_dashboard')
            else:
                form.add_error(None, "Invalid email or password.")

    return render(request, 'accounts/user_login.html', {
        'form': form,
    })






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
    user = request.user
    test_history = OrganizationTestResult.objects.filter(user=user).select_related('test').order_by('-created_at')[:5]

    # Prepare test data
    test_data = []
    for result in test_history:
        topper = OrganizationTestResult.objects.filter(test=result.test).order_by('-percentage', 'time_taken').first()
        test_data.append({
            'test_name': result.test.title,
            'your_marks': result.correct_answers,
            'topper_marks': topper.correct_answers if topper else 'N/A',
            'percentage': result.percentage,
            'date': result.created_at,
            'result_id': result.id
        })

    context = {
        'user': user,
        'test_history': test_data
    }
    return render(request, 'accounts/user_profile.html', {
        'user': request.user,
        'test_history': test_data 
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

    total_active_tests = OrganizationTest.objects.filter(
        organization=organization,
        is_cancelled=False
    ).count()

    total_participants = OrganizationTestResult.objects.filter(
        test__organization=organization
    ).values('user').distinct().count()

    moderators = ModeratorProfile.objects.filter(organization=organization)

    recent_tests = OrganizationTest.objects.filter(
        organization=organization,
        is_cancelled=False
    ).order_by('-date_created')[:5]

    context = {
        'organization': organization,
        'moderators': moderators,
        'total_active_tests': total_active_tests,
        'total_participants': total_participants,
        'recent_tests': recent_tests,
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
                
                # Get absolute login URL correctly using reverse()
                login_path = reverse('moderator-login')  # e.g. '/moderator/login/'
                login_url = request.build_absolute_uri(login_path)  # full URL
                
                # Build site_url for absolute image URLs (removes trailing slash)
                site_url = request.build_absolute_uri('/')[:-1]
                
                # Prepare email content with site_url for absolute image URLs
                email_context = {
                    'moderator_name': full_name,
                    'organization_name': organization.name,
                    'email': email,
                    'password': password,
                    'login_url': login_url,
                    'organization': organization,  # for organization.logo.url
                    'site_url': site_url,
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
            
            # Set organization based on who's creating the test
            
            user = request.user

            if hasattr(user, 'org_admin_profile'): 
                organization = user.org_admin_profile.organization
            else:
                organization = user.moderator_profile.organization
                
            test.organization = organization
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
            print("Form Errors:", form.errors)
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
from django.contrib.auth.decorators import login_required, user_passes_test

@login_required
@user_passes_test(is_org_admin_or_moderator)

def get_random_questions(request, subject_id):
    count = int(request.GET.get('count', 0))
    easy = int(request.GET.get('easy', 0))
    medium = int(request.GET.get('medium', 0))
    hard = int(request.GET.get('hard', 0))

    total_requested = easy + medium + hard

    # Only show error if total difficulty-wise count exceeds the total
    if total_requested > count:
        return JsonResponse({
            'error': 'The sum of difficulty-wise questions exceeds the total number of questions.'
        }, status=400)

    questions = []
    added_ids = set()

    def get_random_by_difficulty(level_name, num_required, exclude_ids):
        qs = list(
            Question.objects.filter(subject_id=subject_id, difficulty=level_name)
            .exclude(id__in=exclude_ids)
        )
        return random.sample(qs, min(num_required, len(qs)))

    # Fetch difficulty-wise questions
    easy_qs = get_random_by_difficulty('Easy', easy, added_ids)
    added_ids.update(q.id for q in easy_qs)

    medium_qs = get_random_by_difficulty('Medium', medium, added_ids)
    added_ids.update(q.id for q in medium_qs)

    hard_qs = get_random_by_difficulty('Hard', hard, added_ids)
    added_ids.update(q.id for q in hard_qs)

    questions.extend(easy_qs + medium_qs + hard_qs)

    # Fill remaining questions with easy-level ones
    remaining = count - len(questions)
    if remaining > 0:
        filler_easy = get_random_by_difficulty('Easy', remaining, added_ids)
        added_ids.update(q.id for q in filler_easy)
        questions.extend(filler_easy)

    # Final fallback: fill any still missing count
    if len(questions) < count:
        needed = count - len(questions)
        remaining_pool = list(
            Question.objects.filter(subject_id=subject_id)
            .exclude(id__in=added_ids)
        )
        questions += random.sample(remaining_pool, min(needed, len(remaining_pool)))

    return JsonResponse({
        'questions': [{
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
            'difficulty': q.difficulty,
            'correct_option': q.correct_option,
        } for q in questions]
    })



@login_required
@user_passes_test(is_org_admin_or_moderator)
def get_questions_by_subject(request, subject_id):
    questions = Question.objects.filter(subject_id=subject_id)

    def resolve_correct_option(q):
        if q.correct_option == q.option1:
            return 'option1'
        elif q.correct_option == q.option2:
            return 'option2'
        elif q.correct_option == q.option3:
            return 'option3'
        elif q.correct_option == q.option4:
            return 'option4'
        return None

    return JsonResponse({
        'questions': [{
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
            'difficulty': q.difficulty,
            'correct_option': resolve_correct_option(q),
        } for q in questions]
    })



@login_required
@user_passes_test(is_org_admin_or_moderator)
def get_questions_by_ids(request):
    data = json.loads(request.body)
    ids = data.get('ids', [])
    questions = Question.objects.filter(id__in=ids)

    def resolve_correct_option(q):
        if q.correct_option == q.option1:
            return 'option1'
        elif q.correct_option == q.option2:
            return 'option2'
        elif q.correct_option == q.option3:
            return 'option3'
        elif q.correct_option == q.option4:
            return 'option4'
        return None

    return JsonResponse({
        'questions': [{
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
            'difficulty': q.difficulty,
            'correct_option': resolve_correct_option(q),
        } for q in questions]
    })

    
import json
from django.views.decorators.csrf import csrf_exempt
from .models import Subject
from django.http import JsonResponse

@csrf_exempt
def create_subject(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        if not name:
            return JsonResponse({'success': False, 'error': 'Subject name is required'})

        if Subject.objects.filter(name__iexact=name).exists():
            return JsonResponse({'success': False, 'error': 'Subject already exists'})

        subject = Subject.objects.create(name=name)
        return JsonResponse({'success': True, 'id': subject.id})
    return JsonResponse({'success': False, 'error': 'Invalid method'})


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt # If you handle CSRF differently for APIs
from .models import Question, Subject # Make sure to import your models
import json
import uuid # For qid

@csrf_exempt # Only if you are sure about CSRF implications for this API endpoint.
             # Otherwise, ensure CSRF token is handled correctly by the client.
             # The JS already sends X-CSRFToken, so this might not be needed if Django's CSRF middleware is standard.
def add_manual_question(request):
    if request.method == 'POST':
        try:
            # 1. Parse JSON data from the request body
            data = json.loads(request.body)

            text = data.get('text')
            option1 = data.get('option1')
            option2 = data.get('option2')
            option3 = data.get('option3') or '' # Handle optional fields
            option4 = data.get('option4') or '' # Handle optional fields
            correct_option_key = data.get('correct_option') # This will be 'option1', 'option2', etc.
            difficulty = data.get('difficulty')
            subject_id = data.get('subject_id')

            # Basic validation (add more as needed)
            if not all([text, option1, option2, correct_option_key, difficulty, subject_id]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)

            try:
                subject = Subject.objects.get(id=subject_id)
            except Subject.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Invalid subject ID'}, status=400)

            # Generate a unique qid (if you still need this format)
            # If your Question model's primary key `id` is an AutoField, 
            # that's usually enough for uniqueness.
            # qid_value = f"Q{uuid.uuid4().hex[:8].upper()}"

            question = Question.objects.create(
                subject=subject,
                # qid=qid_value, # If you have a qid field
                text=text,
                option1=option1,
                option2=option2,
                option3=option3,
                option4=option4,
                correct_option=correct_option_key, # 2. Save the key directly
                difficulty=difficulty
            )

            # 3. Ensure the response includes all fields needed by the frontend
            return JsonResponse({
                'success': True,
                'question': {
                    'id': question.id, # Use the actual database ID
                    'text': question.text,
                    'option1': question.option1,
                    'option2': question.option2,
                    'option3': question.option3,
                    'option4': question.option4,
                    'correct_option': question.correct_option, # Include this
                    'difficulty': question.difficulty,         # Include this
                    'subject_id': subject.id # Good to include for consistency
                }
            }, status=201) # 201 Created is a good status for new resources

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # Log the exception e for debugging
            print(f"Error in add_manual_question: {e}") 
            return JsonResponse({'success': False, 'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method. Only POST is allowed.'}, status=405)


from .models import OrganizationTest

from accounts.models import OrganizationTest

def view_tests(request):
    user = request.user

    # Determine the organization
    if hasattr(user, 'org_admin_profile'):
        organization = user.org_admin_profile.organization
        # Org admin sees all tests in the org
        tests = OrganizationTest.objects.filter(
            organization=organization,
            is_cancelled=False
        ).order_by('-date_created')

    elif hasattr(user, 'moderator_profile'):
        organization = user.moderator_profile.organization
        # Moderator sees only their own tests
        tests = OrganizationTest.objects.filter(
            organization=organization,
            created_by=user,
            is_cancelled=False
        ).order_by('-date_created')

    else:
        # fallback — forbidden or redirect
        return HttpResponseForbidden("Unauthorized access.")

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
from .models import OrganizationTest, TestQuestion, Question

@login_required
@user_passes_test(is_org_admin_or_moderator)
def edit_test(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)

    if request.method == 'POST':
        test.title = request.POST.get('title')
        test.test_code = request.POST.get('test_code')
        test.total_questions = request.POST.get('total_questions')
        test.duration = request.POST.get('duration')
        test.full_marks = request.POST.get('full_marks')
        test.subject_id = request.POST.get('subject')
        test.save()

        # Update selected questions
        question_ids = request.POST.get('question_ids', '')
        question_id_list = [int(qid) for qid in question_ids.split(',') if qid.isdigit()]

        TestQuestion.objects.filter(test=test).delete()
        for qid in question_id_list:
            question = Question.objects.get(id=qid)
            TestQuestion.objects.create(test=test, question=question)

        messages.success(request, "Test updated successfully.", extra_tags='admin')
        return redirect('view-tests')

    subjects = Subject.objects.all()
    test_questions = TestQuestion.objects.filter(test=test).select_related('question')

    return render(request, 'accounts/edit_test.html', {
        'test': test,
        'subjects': subjects,
        'test_questions': test_questions,
        'active_page': 'open_tests',
    })


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
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden

@login_required
def closed_tests_view(request):
    user = request.user

    if hasattr(user, 'org_admin_profile'):
        organization = user.org_admin_profile.organization
        closed_tests = OrganizationTest.objects.filter(
            organization=organization,
            is_cancelled=True
        ).select_related('subject', 'created_by', 'cancelled_by')

    elif hasattr(user, 'moderator_profile'):
        organization = user.moderator_profile.organization
        closed_tests = OrganizationTest.objects.filter(
            organization=organization,
            is_cancelled=True,
            created_by=user  # Only their tests
        ).select_related('subject', 'created_by', 'cancelled_by')

    else:
        return HttpResponseForbidden("You do not have permission to access this page.")

    return render(request, 'accounts/closed_tests.html', {
        'tests': closed_tests
    })






from django.shortcuts import render, redirect, reverse, get_object_or_404
from .models import OrganizationTest, TestQuestion, OrganizationTestResult
from django.contrib.auth.decorators import login_required

@login_required
def start_org_test_view(request, test_code):
    try:
        test = OrganizationTest.objects.get(test_code=test_code, is_cancelled=False)
    except OrganizationTest.DoesNotExist:
        return redirect('organization_tests')

    # 🔒 Prevent access if already submitted
    existing_result = OrganizationTestResult.objects.filter(user=request.user, test=test).first()
    if existing_result:
        return redirect('org_test_result', result_id=existing_result.id)

    test_questions = TestQuestion.objects.filter(test=test).select_related('question')
    return render(request, 'accounts/org_test_page.html', {
        'test': test,
        'test_questions': test_questions
    })


# accounts/views.py
from django.shortcuts import render, redirect, get_object_or_404
from .models import OrganizationTest, OrganizationTestResult, TestQuestion, Question

from django.contrib.auth.decorators import login_required

from .models import TestProgress
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from .models import OrganizationTestResult, TestQuestion, OrganizationTest, TestProgress
import json

def submit_org_test_view(request):
    if request.method == 'POST':
        test_id = request.POST.get('test_id')
        test = get_object_or_404(OrganizationTest, id=test_id)
        questions = TestQuestion.objects.filter(test=test)

        total_questions = questions.count()
        correct_answers = 0
        user_answers = {}

        for tq in questions:
            qid = f"q{tq.question.id}"
            selected = request.POST.get(qid)
            user_answers[qid] = selected
            if selected and selected.strip() == tq.question.correct_option.strip():
                correct_answers += 1

        percentage = round((correct_answers / total_questions) * 100, 2)

        time_left = 0
        try:
            progress = TestProgress.objects.get(user=request.user, test_id=test.id)
            time_left = progress.time_left
        except TestProgress.DoesNotExist:
            progress = None

        time_taken = test.total_time * 60 - time_left

        result = OrganizationTestResult.objects.create(
            user=request.user,
            test=test,
            total_questions=total_questions,
            correct_answers=correct_answers,
            percentage=percentage,
            answers=user_answers,
            time_taken=time_taken
        )

        return redirect('org_test_result', result_id=result.id)

    return redirect('organization_tests')

from django.shortcuts import render, get_object_or_404
from django.db.models import Avg
from .models import OrganizationTestResult, TestQuestion, TestProgress
import json

from django.shortcuts import render, get_object_or_404
from django.db.models import Avg
from .models import OrganizationTestResult, TestQuestion, TestProgress
import json

@login_required

def organization_test_result_view(request, result_id):
    result = get_object_or_404(OrganizationTestResult, id=result_id, user=request.user)
    test = result.test
    questions = TestQuestion.objects.filter(test=test).select_related('question')

    # Prepare question-wise data and difficulty stats
    question_data = []
    difficulty_stats = {
        'Easy': {'correct': 0, 'total': 0},
        'Medium': {'correct': 0, 'total': 0},
        'Hard': {'correct': 0, 'total': 0}
    }

    for tq in questions:
        q = tq.question
        qid = f"q{q.id}"
        user_answer = result.answers.get(qid)
        correct_option = q.correct_option.strip()
        is_correct = user_answer and user_answer.strip() == correct_option

        question_data.append({
            'id': q.id,
            'text': q.text,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
            'correct': correct_option,
            'selected': user_answer,
            'is_correct': is_correct,
            'difficulty': q.difficulty
        })

        difficulty_stats[q.difficulty]['total'] += 1
        if is_correct:
            difficulty_stats[q.difficulty]['correct'] += 1

    def calculate_percentage(correct, total):
        return round((correct / total) * 100) if total > 0 else 0

    # Difficulty breakdown
    difficulty_breakdown = {}
    for level in ['Easy', 'Medium', 'Hard']:
        total = difficulty_stats[level]['total']
        correct = difficulty_stats[level]['correct']
        attempted = sum(1 for q in question_data if q['difficulty'] == level and q['selected'])
        incorrect = attempted - correct
        unattempted = total - attempted
        difficulty_breakdown[level.lower()] = {
            'total': total,
            'correct': correct,
            'incorrect': incorrect,
            'unattempted': unattempted
        }

    easy_percentage = calculate_percentage(difficulty_stats['Easy']['correct'], difficulty_stats['Easy']['total'])
    medium_percentage = calculate_percentage(difficulty_stats['Medium']['correct'], difficulty_stats['Medium']['total'])
    hard_percentage = calculate_percentage(difficulty_stats['Hard']['correct'], difficulty_stats['Hard']['total'])

    # Leaderboard and stats
    all_results = OrganizationTestResult.objects.filter(test=test)
    average_percentage = all_results.aggregate(avg=Avg('percentage'))['avg'] or 0

    def get_average_difficulty_percentage(level):
        correct = total = 0
        for res in all_results:
            for tq in TestQuestion.objects.filter(test=res.test).select_related('question'):
                q = tq.question
                if q.difficulty == level:
                    qid = f"q{q.id}"
                    answer = res.answers.get(qid)
                    if answer and q.correct_option.strip() == answer.strip():
                        correct += 1
                    total += 1
        return calculate_percentage(correct, total)

    average_easy_percentage = get_average_difficulty_percentage('Easy')
    average_medium_percentage = get_average_difficulty_percentage('Medium')
    average_hard_percentage = get_average_difficulty_percentage('Hard')

    # Time formatter
    def format_time(seconds):
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"

    # Speed calculation
    minutes_taken = result.time_taken / 60 if result.time_taken > 0 else 1
    speed = result.total_questions / minutes_taken
    time_taken_formatted = format_time(result.time_taken)

    # Leaderboard (with formatted time)
    leaderboard_raw = OrganizationTestResult.objects.filter(test=test).select_related('user').order_by('-percentage', 'time_taken')
    leaderboard = []
    for rank, entry in enumerate(leaderboard_raw, start=1):
        leaderboard.append({
            'id': entry.id,
            'user': entry.user,
            'percentage': entry.percentage,
            'correct_answers': entry.correct_answers,
            'total_questions': entry.total_questions,
            'time_taken': format_time(entry.time_taken),  # Display
            'time_taken_seconds': entry.time_taken, 
            'created_at': entry.created_at,
            'rank': rank
        })

    user_rank = next((entry['rank'] for entry in leaderboard if entry['id'] == result.id), None)

    # Time taken comparison
    topper_result = leaderboard[0] if leaderboard else None
    topper_time_taken = leaderboard_raw[0].time_taken if leaderboard_raw else 0
    average_time_taken = all_results.aggregate(avg=Avg('time_taken'))['avg'] or 0

    topper_time_formatted = format_time(topper_time_taken)
    average_time_formatted = format_time(int(average_time_taken))

    return render(request, 'accounts/test_result.html', {
        'result': result,
        'test': test,
        'question_data': question_data,
        'leaderboard': leaderboard,
        'user_rank': user_rank,
        'time_taken_formatted': time_taken_formatted,
        'speed': round(speed, 1),
        'average_percentage': round(average_percentage),
        'easy_percentage': easy_percentage,
        'medium_percentage': medium_percentage,
        'hard_percentage': hard_percentage,
        'average_easy_percentage': average_easy_percentage,
        'average_medium_percentage': average_medium_percentage,
        'average_hard_percentage': average_hard_percentage,
        'difficulty_breakdown': difficulty_breakdown,
        'time_data_json': json.dumps([]),  # per-question time disabled for now
        'topper_time_formatted': topper_time_formatted,
        'average_time_formatted': average_time_formatted
    })


from .models import OrganizationTestResult

from django.db.models import Q
from .models import OrganizationTestResult, Subject

@login_required
def organization_test_history_view(request):
    subject_id = request.GET.get('subject')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    results = OrganizationTestResult.objects.filter(user=request.user).select_related('test', 'test__subject')

    # Filter by subject
    if subject_id:
        results = results.filter(test__subject__id=subject_id)

    # Filter by date
    if start_date:
        results = results.filter(created_at__date__gte=start_date)
    if end_date:
        results = results.filter(created_at__date__lte=end_date)

    subjects = Subject.objects.all()

    return render(request, 'accounts/test_history.html', {
        'results': results.order_by('-created_at'),
        'subjects': subjects,
        'selected_subject': subject_id,
        'start_date': start_date,
        'end_date': end_date,
    })




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

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
import json
from .models import TestProgress

@csrf_exempt
def save_test_progress(request):
    if request.method == 'POST' and request.user.is_authenticated:
        try:
            data = json.loads(request.body)
            test_id = data.get('test_id')
            answers = data.get('answers', {})
            time_left = int(data.get('time_left', 0))

            if not test_id:
                return JsonResponse({'status': 'error', 'reason': 'Missing test_id'}, status=400)

            TestProgress.objects.update_or_create(
                user=request.user,
                test_id=test_id,
                defaults={'answers': answers, 'time_left': time_left}
            )
            return JsonResponse({'status': 'saved'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'unauthorized'}, status=401)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import TestProgress  

def get_test_progress(request, test_id):
    if request.user.is_authenticated:
        try:
            progress = TestProgress.objects.get(user=request.user, test_id=test_id)
            return JsonResponse({
                'answers': progress.answers,
                'time_left': progress.time_left
            })
        except TestProgress.DoesNotExist:
            pass
    return JsonResponse({}, status=404)




from django.http import JsonResponse
from .models import OrganizationTest, TestQuestion

def test_details(request, test_id):
    try:
        test = OrganizationTest.objects.get(id=test_id)
        questions = TestQuestion.objects.filter(test=test).select_related('question')

        question_list = []
        for tq in questions:
            q = tq.question
            question_list.append({
                'text': q.text,
                'option1': q.option1,
                'option2': q.option2,
                'option3': q.option3,
                'option4': q.option4
            })

        data = {
            'organization_name': test.organization.name, 
            'title': test.title,
            'code': test.test_code,
            'duration': test.total_time,
            'marks': test.total_marks,
            'questions': question_list,
            'org_logo': test.organization.logo.url if test.organization.logo else None  # Add this line

        }
        return JsonResponse(data)
    except OrganizationTest.DoesNotExist:
        return JsonResponse({'error': 'Test not found'}, status=404)
    
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageTemplate, Frame
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from io import BytesIO
import os
from django.conf import settings
from datetime import datetime
from .models import OrganizationTest, TestQuestion

class PDFCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        self.logo_path = kwargs.pop('logo_path', None)
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._page_count = 0
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()
        self._page_count += 1

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            
            # Draw watermark on every page
            if self.logo_path and os.path.exists(self.logo_path):
                self.saveState()
                self.setFillAlpha(0.1)  # 10% opacity
                self.drawImage(self.logo_path, 
                             x=inch, 
                             y=self._pagesize[1]/2 - inch, 
                             width=self._pagesize[0] - 2*inch, 
                             height=2*inch,
                             preserveAspectRatio=True,
                             anchor='c')
                self.restoreState()
            
            # Draw footer on every page
            self.saveState()
            self.setFont('Helvetica', 8)
            self.setFillColor(colors.gray)
            footer_text = (
                f"Downloaded by: {self.user.get_full_name() or self.user.email} | "
                f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | "
                f"System: TestMaster | Page {self._pageNumber} of {num_pages}"
            )
            self.drawString(inch, 0.75*inch, footer_text)
            self.restoreState()
            
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

def generate_question_paper_pdf(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)
    test_questions = TestQuestion.objects.filter(test=test).select_related('question').order_by('id')
    
    # Get organization logo if exists
    logo_path = None
    if test.organization and test.organization.logo:
        logo_path = os.path.join(settings.MEDIA_ROOT, test.organization.logo.name)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{test.title}_Question_Paper.pdf"'
    
    buffer = BytesIO()
    
    # Create PDF with custom canvas
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                          rightMargin=36, leftMargin=36,
                          topMargin=72, bottomMargin=36)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Define all custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        alignment=1,
        textColor=colors.HexColor('#4361ee'),
        spaceAfter=12
    )
    
    question_style = ParagraphStyle(
        'Question',
        parent=styles['BodyText'],
        fontSize=12,
        textColor=colors.black,
        spaceAfter=6,
        leftIndent=12
    )
    
    option_style = ParagraphStyle(
        'Option',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=colors.HexColor('#555555'),
        leftIndent=36,
        spaceAfter=3
    )
    
    # Add organization logo at top if exists
    if logo_path and os.path.exists(logo_path):
        logo = Image(logo_path, width=1.5*inch, height=0.75*inch)
        logo.hAlign = 'CENTER'
        elements.append(logo)
        elements.append(Spacer(1, 12))
    
    # Add title and metadata
    elements.append(Paragraph(test.title, title_style))
    
    meta_data = [
        [Paragraph(f"<b>Test Code:</b> {test.test_code}", styles['BodyText']),
         Paragraph(f"<b>Duration:</b> {test.total_time} minutes", styles['BodyText'])],
        [Paragraph(f"<b>Total Marks:</b> {test.total_marks}", styles['BodyText']),
         Paragraph(f"<b>Organization:</b> {test.organization.name}", styles['BodyText'])]
    ]
    
    meta_table = Table(meta_data, colWidths=[3*inch, 3*inch])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 24))
    
    # Add questions
    for idx, test_question in enumerate(test_questions, start=1):
        question = test_question.question
        question_text = f"Q{idx}. {question.text}"
        if test_question.is_star_question:
            question_text += " ★"
        
        elements.append(Paragraph(question_text, question_style))
        
        options = [
            (f"A. {question.option1}", 'A'),
            (f"B. {question.option2}", 'B'),
        ]
        if question.option3:
            options.append((f"C. {question.option3}", 'C'))
        if question.option4:
            options.append((f"D. {question.option4}", 'D'))
        
        for option_text, _ in options:
            elements.append(Paragraph(option_text, option_style))
        
        elements.append(Spacer(1, 12))
    
    # Build the PDF with our custom canvas
    doc.build(elements, canvasmaker=lambda *args, **kw: PDFCanvas(*args, user=request.user, logo_path=logo_path, **kw))
    
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    
    return response
    
def format_duration(seconds):
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes}m {secs}s"

from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.pdfgen import canvas
from .models import OrganizationTestResult, OrganizationTest

@login_required
def org_test_results_admin_view(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)
    results = OrganizationTestResult.objects.filter(test=test).select_related('user').order_by('-correct_answers', 'created_at')
    
    for r in results:
        r.time_taken_formatted = format_duration(r.time_taken or 0)
        
    return render(request, 'accounts/admin_test_results.html', {
        'test': test,
        'results': results,
        'active_page': 'closed_tests',
    })

@login_required
def export_test_results_excel(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)
    results = OrganizationTestResult.objects.filter(test=test).select_related('user')

    wb = Workbook()
    ws = wb.active
    ws.append(['Name', 'Score', 'Time Taken (sec)', 'Percentage', 'Date'])

    for res in results:
        ws.append([
            res.user.get_full_name() or res.user.email,
            res.correct_answers,
            res.time_taken,
            res.percentage,
            res.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = f'attachment; filename="{test.title}_results.xlsx"'
    wb.save(response)
    return response

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from io import BytesIO
import os
from django.conf import settings
from .models import OrganizationTest, OrganizationTestResult, Organization

class WatermarkedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        self.logo_path = kwargs.pop('logo_path', None)
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.width, self.height = letter

    def showPage(self):
        self.saveState()
        # Draw watermark if logo exists
        if self.logo_path and os.path.exists(self.logo_path):
            self.setFillAlpha(0.1)  # 10% opacity
            self.drawImage(self.logo_path, 
                         x=inch, 
                         y=self.height/2 - inch, 
                         width=self.width - 2*inch, 
                         height=2*inch,
                         preserveAspectRatio=True,
                         anchor='c')
            self.setFillAlpha(1)  # Reset opacity
        self.restoreState()
        canvas.Canvas.showPage(self)

@login_required
def export_test_results_pdf(request, test_id):
    test = get_object_or_404(OrganizationTest, id=test_id)
    results = OrganizationTestResult.objects.filter(test=test).select_related('user').order_by('-percentage')
    
    # Get organization logo if exists
    logo_path = None
    if test.organization and test.organization.logo:
        logo_path = os.path.join(settings.MEDIA_ROOT, test.organization.logo.name)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{test.title}_results.pdf"'
    
    buffer = BytesIO()
    
    # Create PDF with optional watermark
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                          rightMargin=30, leftMargin=30, 
                          topMargin=30, bottomMargin=30)
    
    elements = []
    
    # Custom styles
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        alignment=1,
        textColor=colors.HexColor('#4361ee'),
        spaceAfter=20
    )
    
    # Add title with organization name if available
    title_text = f"Test Results: {test.title}"
    if test.organization:
        title_text += f"<br/><font size='10' color='#6c757d'>{test.organization.name}</font>"
    
    elements.append(Paragraph(title_text, title_style))
    
    # Summary info
    summary_data = [
        ["Total Participants:", str(len(results))],
        ["Highest Score:", f"{max(r.percentage for r in results) if results else 0}%"],
        ["Average Score:", f"{sum(r.percentage for r in results)/len(results) if results else 0:.1f}%"]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8f9fa')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dee2e6')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Main results table
    data = [["#", "Participant", "Score", "Percentage", "Time Taken", "Date"]]
    
    for idx, result in enumerate(results, start=1):
        data.append([
            str(idx),
            result.user.get_full_name() or result.user.email,
            f"{result.correct_answers}/{test.total_marks}",
            f"{result.percentage}%",
            f"{result.time_taken}s" if result.time_taken else "N/A",
            result.created_at.strftime("%Y-%m-%d %H:%M")
        ])
    
    table = Table(data, colWidths=[0.5*inch, 2.5*inch, 1*inch, 1*inch, 1*inch, 1.5*inch])
    
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4361ee')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dddddd')),
        ('FONTSIZE', (0,1), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8f9fa')]),
    ]))
    
    elements.append(table)
    
    # Build PDF with optional watermark
    doc.build(elements, canvasmaker=lambda *args, **kw: WatermarkedCanvas(*args, logo_path=logo_path, **kw))
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    
    return response



from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import OrganizationTestResult
from collections import defaultdict

@login_required
def participants_view(request):
    # Get all test results for the current organization
    results = OrganizationTestResult.objects.select_related('user', 'test').all()

    participants_dict = defaultdict(lambda: {'email': '', 'tests': set()})

    for result in results:
        user = result.user
        participants_dict[user.id]['name'] = user.get_full_name() or user.username
        participants_dict[user.id]['email'] = user.email
        participants_dict[user.id]['tests'].add(result.test.title)

    participants = [
        {
            'id': uid,
            'name': data['name'],
            'email': data['email'],
            'tests': list(data['tests'])
        }
        for uid, data in participants_dict.items()
    ]

    return render(request, 'accounts/participants.html', {
        'participants': participants
    })

from django.shortcuts import render
from django.db.models import Count, Avg
from .models import OrganizationTest, OrganizationTestResult

from django.db.models import Count, Avg
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import OrganizationTest, OrganizationTestResult
from django.db.models import Count, Avg
from django.db.models.functions import TruncDate
from django.http import HttpResponseForbidden
from django.db.models.functions import TruncDate

@login_required

def organization_analytics(request):
    user = request.user

    if hasattr(user, 'org_admin_profile'):
        org = user.org_admin_profile.organization
        tests = OrganizationTest.objects.filter(organization=org)
        results = OrganizationTestResult.objects.filter(test__organization=org)

    elif hasattr(user, 'moderator_profile'):
        org = user.moderator_profile.organization
        tests = OrganizationTest.objects.filter(organization=org, created_by=user)
        results = OrganizationTestResult.objects.filter(test__in=tests)

    else:
        return HttpResponseForbidden("Unauthorized access.")

    # Efficient counts
    total_tests = tests.count()
    total_participants = results.values('user').distinct().count()
    total_attempts = results.count()

    # Top 5 most attempted tests
    top_tests = (
        results
        .values('test__title')
        .annotate(attempts=Count('id'))
        .order_by('-attempts')[:5]
    )

    # Avg score per test (based on percentage)
    avg_scores = (
        results
        .values('test__title')
        .annotate(avg_score=Avg('percentage'))
        .order_by('-avg_score')[:5]
    )

    # Participation over time using TruncDate (much faster than .extra)
    participation_chart = (
        results
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    context = {
        'total_tests': total_tests,
        'total_participants': total_participants,
        'total_attempts': total_attempts,
        'top_tests': list(top_tests),
        'avg_scores': list(avg_scores),
        'participation_chart': list(participation_chart),
    }

    return render(request, 'accounts/analytics.html', context)




@login_required
def moderator_dashboard(request):
    if not hasattr(request.user, 'moderator_profile'):
        return redirect('moderator-login')
    
    # Add moderator dashboard logic here
    return render(request, 'accounts/moderator_dashboard.html')


from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

@login_required
def moderator_settings(request):
    user = request.user

    if not hasattr(user, 'moderator_profile'):
        return HttpResponseForbidden("You are not authorized to access this page.")

    if request.method == 'POST':
        form = PasswordChangeForm(user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Prevent logout
            messages.success(request, "Password updated successfully.")
            return redirect('moderator_settings')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = PasswordChangeForm(user)

    return render(request, 'accounts/moderator_settings.html', {
        'form': form
    })


# views.py

import random
from django.core.mail import send_mail
from django.utils.timezone import now, timedelta
from django.contrib.auth import get_user_model
from .models import PasswordResetCode
from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.timezone import now
import random
User = get_user_model()

def forgot_password_request(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)

            # Limit: Check if user already requested 5 times today
            today_attempts = PasswordResetCode.objects.filter(
                user=user,
                created_at__gte=now().replace(hour=0, minute=0, second=0),
            ).count()

            if today_attempts >= 5:
                messages.error(request, "You have exceeded the verification request limit (5/day).")
                return render(request, 'accounts/email/forgot_password.html')


            # Invalidate old codes by deleting them before creating a new one
            PasswordResetCode.objects.filter(user=user).delete()
            
            # Generate 6-digit code
            code = str(random.randint(100000, 999999))
            PasswordResetCode.objects.create(user=user, code=code)

            # Send email
            subject = '🔐 Your TestMaster Verification Code'
            from_email = settings.DEFAULT_FROM_EMAIL
            context = {
                'code': code,
                'recipient': email,
                'now': now(),
            }
            html_content = render_to_string('accounts/email/verification_code_email.html', context)

            msg = EmailMultiAlternatives(subject, '', from_email, [email])
            msg.attach_alternative(html_content, "text/html")
            msg.send()


            request.session['reset_email'] = email
            messages.success(request, 'Verification code sent to your email.')
            return redirect('verify_reset_code')

        except User.DoesNotExist:
            messages.error(request, 'No account found with that email.')

    return render(request, 'accounts/email/forgot_password.html')


def verify_reset_code(request):
    email = request.session.get('reset_email')
    if not email:
        return redirect('forgot_password')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        messages.error(request, "Session expired. Try again.")
        return redirect('forgot_password')

    if request.method == 'POST':
        code_input = request.POST.get('code')
        valid_codes = PasswordResetCode.objects.filter(user=user, code=code_input).order_by('-created_at')

        if valid_codes.exists() and valid_codes[0].is_valid():
            request.session['verified_email'] = email
            return redirect('reset_password_form')
        else:
            messages.error(request, "Invalid or expired code.")

    return render(request, 'accounts/email/verify_code.html', {'email': email})

from django.contrib.auth.hashers import make_password

def reset_password_form(request):
    email = request.session.get('verified_email')
    if not email:
        return redirect('forgot_password')

    user = User.objects.get(email=email)

    if request.method == 'POST':
        new_password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if new_password != confirm_password:
            messages.error(request, "Passwords do not match.")
        else:
            user.password = make_password(new_password)
            user.save()

            # Cleanup
            PasswordResetCode.objects.filter(user=user).delete()
            request.session.flush()
            messages.success(request, "Password successfully reset. Please login.")
            return redirect('user_login')  # Or wherever login is.

    return render(request, 'accounts/email/reset_password.html')
