from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import User, Organization, OrganizationAdminProfile,OrganizationTest

User = get_user_model()

class SignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

from django import forms
from django.core.exceptions import ValidationError

class LoginForm(forms.Form):
    email = forms.EmailField(label="Email", required=True)
    password = forms.CharField(label="Password", widget=forms.PasswordInput, required=True)

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        password = cleaned_data.get("password")

        if not email or not password:
            raise ValidationError("Both email and password are required.")

        return cleaned_data



# forms.py
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import User, Organization, OrganizationAdminProfile, ModeratorProfile
import re

class OrganizationSignupForm(UserCreationForm):
    organization_name = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={'placeholder': 'Your Organization Name'})
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'placeholder': 'Admin Email'})
    )
    logo = forms.ImageField(
        required=False,
        widget=forms.FileInput(attrs={'accept': 'image/*'})
    )
    
    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')

    def clean_organization_name(self):
        org_name = self.cleaned_data.get('organization_name')
        normalized_name = re.sub(r'\s+', ' ', org_name.strip().lower())
        
        if Organization.objects.filter(name__iexact=normalized_name).exists():
            raise ValidationError("An organization with this name already exists")
        return org_name

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("This email is already registered")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = User.Role.ORG_ADMIN
        if commit:
            user.save()
            organization = Organization.objects.create(
                name=self.cleaned_data['organization_name'],
                logo=self.cleaned_data['logo']
            )
            OrganizationAdminProfile.objects.create(
                user=user,
                organization=organization
            )
        return user

class OrganizationLoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'placeholder': 'Organization Admin Email',
            'class': 'form-control'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Password',
            'class': 'form-control'
        })
    )

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        
        if not email or not password:
            raise forms.ValidationError("Both email and password are required")
        
        return cleaned_data
    
# forms.py
from django.contrib.auth.forms import PasswordChangeForm
from django.utils.crypto import get_random_string

class OrganizationSettingsForm(forms.ModelForm):
    class Meta:
        model = Organization
        fields = ['name', 'logo']

class AddModeratorForm(forms.Form):
        
    full_name = forms.CharField(max_length=100, required=True, widget=forms.EmailInput(attrs={'placeholder': 'Moderator Email'}))
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'placeholder': 'Moderator Email'})
    )

    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("This email is already registered")
        return email

class ModeratorLoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'placeholder': 'Moderator Email',
            'class': 'form-control'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Password',
            'class': 'form-control'
        })
    )

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        
        if not email or not password:
            raise forms.ValidationError("Both email and password are required")
        
        return cleaned_data
    
# accounts/forms.py

from django import forms
from .models import OrganizationTest

from django import forms
from .models import OrganizationTest, Subject

# forms.py
from django import forms
from .models import OrganizationTest, Subject

class AddTestForm(forms.ModelForm):
    subject_name = forms.CharField(max_length=100, required=False, label='New Subject (optional)')

    class Meta:
        model = OrganizationTest
        fields = ['title', 'subject', 'total_questions', 'total_marks', 'total_time', 'test_code']

    def clean_subject(self):
        subject_name = self.cleaned_data.get('subject_name')
        subject = self.cleaned_data.get('subject')

        # If no subject is selected and a new subject name is provided, create the new subject
        if not subject and subject_name:
            # Create the new subject if it doesn't exist
            subject, created = Subject.objects.get_or_create(name=subject_name)

        # If neither a subject is selected nor a new subject name is provided, raise an error
        if not subject:
            raise forms.ValidationError("This field is required.")

        return subject
from django import forms
from .models import ContactMessage

class ContactMessageForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'message']
