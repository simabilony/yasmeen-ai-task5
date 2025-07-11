from rest_framework import serializers
from django.contrib.auth.models import User
from projects.serializers import UserSerializer
from tasks.serializers import TaskSerializer
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    """Serializer للتعليقات"""
    author = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'task', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer لإنشاء تعليق جديد"""
    class Meta:
        model = Comment
        fields = ['content', 'task']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_task(self, value):
        """التحقق من صلاحيات المهمة"""
        user = self.context['request'].user
        if not value.project.is_user_member(user):
            raise serializers.ValidationError("لا يمكن التعليق على مهمة في مشروع غير مشارك فيه")
        return value


class CommentUpdateSerializer(serializers.ModelSerializer):
    """Serializer لتحديث التعليق"""
    class Meta:
        model = Comment
        fields = ['content'] 