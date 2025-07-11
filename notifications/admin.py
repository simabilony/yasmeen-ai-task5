from django.contrib import admin
from .models import Notification, TaskLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(TaskLog)
class TaskLogAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'log_type', 'created_at']
    list_filter = ['log_type', 'created_at']
    search_fields = ['task__title', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at' 