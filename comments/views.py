from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Comment
from .serializers import (
    CommentSerializer, 
    CommentCreateSerializer, 
    CommentUpdateSerializer
)
from .permissions import CommentPermission


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet للتعليقات"""
    queryset = Comment.objects.all()
    permission_classes = [CommentPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['task', 'author']
    search_fields = ['content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """فلترة التعليقات حسب صلاحيات المستخدم"""
        user = self.request.user
        return Comment.objects.filter(
            models.Q(task__project__manager=user) | models.Q(task__project__members=user)
        ).distinct()
    
    def get_serializer_class(self):
        """اختيار Serializer المناسب"""
        if self.action == 'create':
            return CommentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CommentUpdateSerializer
        return CommentSerializer 