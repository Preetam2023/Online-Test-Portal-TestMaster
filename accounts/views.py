
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




@login_required
def user_dashboard(request):
    user = request.user
    return render(request, 'accounts/user_dashboard.html', {'user': user})  

@login_required
def user_profile(request):
    
    test_history = []  # Placeholder for future test history data
    return render(request, 'accounts/user_profile.html', {
        'user': request.user,
        'test_history': test_history
    })
@login_required
def practice_questions(request):
    return render(request, 'accounts/practice_questions.html')








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
@login_required
def mock_test(request):
    return render(request, 'accounts/mock_test.html')
# accounts/views.py
from django.shortcuts import render

@login_required
def mock_test_page(request):
    subject = request.GET.get('subject', '')
    return render(request, 'accounts/mock_test_page.html', {'subject': subject})

@login_required
def submit_test(request):
    # Handle test submission logic here
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

@login_required
def moderator_dashboard(request):
    if not hasattr(request.user, 'moderator_profile'):
        return redirect('moderator-login')
    
    # Add moderator dashboard logic here
    return render(request, 'accounts/moderator_dashboard.html')