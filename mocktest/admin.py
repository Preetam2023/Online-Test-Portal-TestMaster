# mocktest/admin.py

from django.contrib import admin
from .models import MockTest, Question, Option

class OptionInline(admin.TabularInline):
    model = Option
    extra = 3  # Number of empty option fields

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1  # Number of empty question fields

class MockTestAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]
    
admin.site.register(MockTest, MockTestAdmin)
