from django.db import models
from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser

# -------------------- User & Managers --------------------
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
        extra_fields.setdefault('role', User.Role.SUPERADMIN)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None

    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        ORG_ADMIN = "ORG_ADMIN", "Organization Admin"
        SUPERADMIN = "SUPERADMIN", "Super Admin"
        MODERATOR = "MODERATOR", "Moderator"
    
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


# -------------------- Subject & Question Models --------------------
class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon_class = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    qid = models.CharField(max_length=20, unique=True, null=True, blank=True)
    text = models.TextField()
    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200, blank=True, null=True)
    option4 = models.CharField(max_length=200, blank=True, null=True)
    correct_option = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)

    def __str__(self):
        return f"{self.qid} - {self.subject.name}"


class QuestionReport(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.TextField()
    reported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report on {self.question.qid} by {self.user}"


# -------------------- Organization & Profiles --------------------
class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='organization_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    enrollment_number = models.CharField(max_length=50, blank=True, null=True)
    institution = models.CharField(max_length=100, blank=True, null=True)


class OrganizationAdminProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='org_admin_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)


class ModeratorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='moderator_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='added_moderators')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    full_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.full_name} ({self.user.email})"


# -------------------- Tests & Test Questions --------------------
class OrganizationTest(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    total_questions = models.PositiveIntegerField()
    total_marks = models.PositiveIntegerField()  # Add total_marks field
    total_time = models.PositiveIntegerField()  # Add total_time field
    test_code = models.CharField(max_length=20, unique=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    use_random_questions = models.BooleanField(default=False)
    advanced_features = models.BooleanField(default=False)
    allow_negative_marking = models.BooleanField(default=False)
    star_questions_enabled = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_tests'
        )
    cancelled_at = models.DateTimeField(null=True, blank=True)


    def __str__(self):
        return f"{self.title} ({self.organization.name})"


class TestQuestion(models.Model):
    test = models.ForeignKey(OrganizationTest, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    is_star_question = models.BooleanField(default=False)

    def __str__(self):
        return f"Q: {self.question.qid} | Test: {self.test.title}"
