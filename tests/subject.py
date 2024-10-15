from django.db import models
from accounts.models import OrganizationAdmin

class Subject(models.Model):
    name = models.CharField(max_length=255, unique=True)
    organization_admin = models.ForeignKey(OrganizationAdmin, on_delete=models.CASCADE)