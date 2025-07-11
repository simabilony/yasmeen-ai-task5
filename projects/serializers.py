from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project


class UserSerializer(serializers.ModelSerializer):
    """Serializer للمستخدمين"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer للمشاريع"""
    manager = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'manager', 'members', 
            'member_count', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.get_member_count()


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء مشروع جديد"""
    class Meta:
        model = Project
        fields = ['title', 'description', 'members']
    
    def create(self, validated_data):
        members = validated_data.pop('members', [])
        project = Project.objects.create(
            manager=self.context['request'].user,
            **validated_data
        )
        project.members.set(members)
        return project


class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer لتحديث المشروع"""
    class Meta:
        model = Project
        fields = ['title', 'description', 'members', 'is_active'] 