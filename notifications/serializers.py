from rest_framework import serializers
from django.contrib.auth.models import User
from projects.serializers import UserSerializer
from tasks.serializers import TaskSerializer
from comments.serializers import CommentSerializer
from .models import Notification, TaskLog


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer للإشعارات"""
    recipient = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'notification_type', 'title', 'message',
            'task', 'comment', 'is_read', 'created_at'
        ]
        read_only_fields = ['created_at']


class TaskLogSerializer(serializers.ModelSerializer):
    """Serializer لسجلات المهام"""
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    
    class Meta:
        model = TaskLog
        fields = [
            'id', 'task', 'user', 'log_type', 'old_value', 
            'new_value', 'created_at'
        ]
        read_only_fields = ['created_at'] 