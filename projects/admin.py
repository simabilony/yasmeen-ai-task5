from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'manager', 'get_member_count', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description', 'manager__username']
    filter_horizontal = ['members']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.get_member_count()
    get_member_count.short_description = 'عدد الأعضاء' 