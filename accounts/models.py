from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import OrganizationAdminManager
class CustomUser(AbstractUser):
    pass  # Add custom fields later if needed


from django.contrib.auth.models import AbstractUser , AbstractBaseUser , PermissionsMixin , Group , Permission
from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import BaseUserManager

class OrganizationAdmin(AbstractBaseUser , PermissionsMixin):
    organization_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = OrganizationAdminManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['organization_name']

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'Organization Admin'
        verbose_name_plural = 'Organization Admins'

    # Add related_name to groups and user_permissions
    groups = models.ManyToManyField(
        Group,
        related_name="organization_admin_groups",
        blank=True,
        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="organization_admin_user_permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

# Your existing UserSignupForm and UserLoginForm