from django.db import models
from .subject import Subject
from accounts.models import OrganizationAdmin

class Test(models.Model):
    name = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    organization_admin = models.ForeignKey(OrganizationAdmin, on_delete=models.CASCADE)
    total_questions = models.IntegerField()
    total_marks = models.IntegerField()
    duration = models.IntegerField()
    is_active = models.BooleanField(default=True)
# Create your models here.
