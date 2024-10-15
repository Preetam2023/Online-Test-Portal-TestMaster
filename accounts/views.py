# accounts/views.py

from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
from django.contrib import messages
from .forms import LoginForm, SignupForm
from django.contrib.auth.decorators import login_required
from .models import CustomUser
# accounts/views.py
#from questions.models import Subject, Question  # Change this line


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
            return redirect('dashboard')  # Redirect to the dashboard
    else:
        form = SignupForm()

    return render(request, 'accounts/user_signup.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username_or_email = form.cleaned_data['username_or_email']
            password = form.cleaned_data['password']

            # Check if the input is an email
            if '@' in username_or_email:
                try:
                    user = User.objects.get(email=username_or_email)
                    username = user.username
                except User.DoesNotExist:
                    user = None
            else:
                username = username_or_email
            
            # Authenticate the user
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('user_dashboard')  # Change this to your dashboard URL
            else:
                form.add_error(None, "Invalid username/email or password.")
    else:
        form = LoginForm()

    return render(request, 'accounts/user_login.html', {'form': form})

@login_required
def user_dashboard(request):
    user = request.user
    return render(request, 'accounts/user_dashboard.html', {'user': user})  # Create a template for this

@login_required
def user_profile(request):
    # Assuming that test history will be updated in the future
    
    test_history = []  # Placeholder for future test history data
    return render(request, 'accounts/user_profile.html', {
        'user': request.user,
        'test_history': test_history
    })
    
from django.shortcuts import render, redirect
from .forms import OrganizationAdminSignupForm

from django.shortcuts import render
from .models import OrganizationAdmin
from tests.models import Test

@login_required
def test_dashboard(request):
    organization_name = request.GET.get('organization_name')
    if organization_name:
        organization_admin = OrganizationAdmin.objects.get(organization_name__iexact=organization_name)
        tests = Test.objects.filter(organization_admin=organization_admin, is_active=True)
        return render(request, 'accounts/test_dashboard.html', {'tests': tests})
    else:
        return render(request, 'accounts/test_dashboard.html', {'message': 'Organization not registered with us, please contact your organization for any details'})

from django.shortcuts import render, redirect
from .forms import OrganizationAdminSignupForm
from django.contrib.auth import login

def organization_admin_signup(request):
    if request.method == 'POST':
        form = OrganizationAdminSignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = OrganizationAdminSignupForm()
    return render(request, 'accounts/organization_admin_signup.html', {'form': form})

# accounts/views.py

from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from .forms import LoginForm

def admin_login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            users = CustomUser .objects.filter(email=email)
            if users.exists():
                user = users.first()
                if user.check_password(password):
                    login(request, user)
                    return redirect('dashboard')
            else:
                form.add_error(None, 'Invalid email or password')
    else:
        form = LoginForm()
    return render(request, 'accounts/org_admin_login.html', {'form': form})