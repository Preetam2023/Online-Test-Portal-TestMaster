from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile, OrganizationAdminProfile, Organization

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ()


from django.contrib import admin
from .models import Question, Subject, QuestionReport

@admin.register(QuestionReport)
class QuestionReportAdmin(admin.ModelAdmin):
    list_display = ('question', 'user', 'reported_at', 'reason')
    search_fields = ('reason', 'question__text', 'user__username')
    list_filter = ('reported_at', 'question__subject')

# Register your models here
admin.site.register(User, CustomUserAdmin)
admin.site.register(StudentProfile)
admin.site.register(OrganizationAdminProfile)
admin.site.register(Organization)