from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from .forms import SignUpForm
from django.template import engines


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('home')  # Redirect to home after login
    else:
        form = SignUpForm()
    return render(request, 'account/signup.html', {'form': form})

def home(request):
    template_names = [template.name for template in engines['django'].template_loaders[0].get_template_sources('account/home.html')]
    print(template_names)
    return render(request, 'account/home.html')
