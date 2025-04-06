
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

User = get_user_model()  # Use the custom user model

def home(request):
    return render(request, 'accounts/home.html')

def user_signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)  # Use SignupForm
        if form.is_valid():
            # Create a new user
            user = form.save()
            messages.success(request, 'Registration successful. You can now log in.')
            login(request, user)
            return redirect('user_dashboard')  # Redirect to the dashboard
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

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username_or_email = form.cleaned_data['username_or_email']
            password = form.cleaned_data['password']

            # Check if input is email or username
            if '@' in username_or_email:
                # Try to get the user by email
                try:
                    user_obj = User.objects.get(email=username_or_email)
                    username = user_obj.username  # Get username from the email
                except User.DoesNotExist:
                    username = None
            else:
                username = username_or_email  # Assume it's a username

            # Authenticate using the username
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('user_dashboard')  # Redirect to the dashboard
            else:
                form.add_error(None, "Invalid username/email or password.")
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








from django.contrib.auth import login, authenticate
from .forms import OrganizationLoginForm  # Make sure to import the correct form

def admin_login_view(request):
    if request.method == 'POST':
        form = OrganizationLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            
            # First authenticate the user
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                # Then verify they're an organization admin
                if hasattr(user, 'org_admin_profile'):
                    login(request, user)
                    return redirect('organization-admin-dashboard')  # Make sure this URL name matches
                else:
                    form.add_error(None, 'This account is not an organization admin')
            else:
                form.add_error(None, 'Invalid email or password')
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

@login_required
def org_admin_dashboard(request):
    if not hasattr(request.user, 'organization'):
        return redirect('home')
    return render(request, 'accounts/org_admin_dashboard.html')