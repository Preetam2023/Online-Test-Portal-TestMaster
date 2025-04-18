from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.SUPERADMIN)  # optional but useful

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None

    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        ORG_ADMIN = "ORG_ADMIN", "Organization Admin"
        SUPERADMIN = "SUPERADMIN", "Super Admin"
    
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'



class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='organization_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    # Add student-specific fields
    enrollment_number = models.CharField(max_length=50, blank=True, null=True)
    institution = models.CharField(max_length=100, blank=True, null=True)

class OrganizationAdminProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='org_admin_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    # Add org admin-specific fields
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    
from django.contrib.auth.models import BaseUserManager

