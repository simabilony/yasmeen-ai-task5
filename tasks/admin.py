from django.contrib import admin
from .models import Task, TaskFollower


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assignee', 'status', 'priority', 'due_date', 'is_pinned']
    list_filter = ['status', 'priority', 'is_pinned', 'created_at', 'project']
    search_fields = ['title', 'description', 'project__title', 'assignee__username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(TaskFollower)
class TaskFollowerAdmin(admin.ModelAdmin):
    list_display = ['user', 'task', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'task__title']
    readonly_fields = ['created_at'] 