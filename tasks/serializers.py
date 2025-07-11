from rest_framework import serializers
from django.contrib.auth.models import User
from projects.serializers import ProjectSerializer, UserSerializer
from .models import Task, TaskFollower


class TaskSerializer(serializers.ModelSerializer):
    """Serializer للمهام"""
    project = ProjectSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    followers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'assignee', 'created_by',
            'status', 'priority', 'due_date', 'created_at', 'updated_at',
            'is_pinned', 'followers_count'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_followers_count(self, obj):
        return obj.followers.count()


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء مهمة جديدة"""
    class Meta:
        model = Task
        fields = ['title', 'description', 'project', 'assignee', 'priority', 'due_date']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_project(self, value):
        """التحقق من صلاحيات المشروع"""
        user = self.context['request'].user
        if not value.is_user_member(user):
            raise serializers.ValidationError("لا يمكن إنشاء مهمة في مشروع غير مشارك فيه")
        return value
    
    def validate_assignee(self, value):
        """التحقق من كون المكلف عضو في المشروع"""
        if value:
            project = self.initial_data.get('project')
            if project and not project.is_user_member(value):
                raise serializers.ValidationError("المكلف يجب أن يكون عضو في المشروع")
        return value


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer لتحديث المهمة"""
    class Meta:
        model = Task
        fields = ['title', 'description', 'assignee', 'status', 'priority', 'due_date', 'is_pinned']


class TaskFollowerSerializer(serializers.ModelSerializer):
    """Serializer لمتابعي المهام"""
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    
    class Meta:
        model = TaskFollower
        fields = ['id', 'user', 'task', 'created_at']
        read_only_fields = ['created_at']


class TaskFollowerCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء متابع جديد"""
    class Meta:
        model = TaskFollower
        fields = ['task']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_task(self, value):
        """التحقق من صلاحيات المهمة"""
        user = self.context['request'].user
        if not value.project.is_user_member(user):
            raise serializers.ValidationError("لا يمكن متابعة مهمة في مشروع غير مشارك فيه")
        return value 