from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Notification, TaskLog
from .serializers import NotificationSerializer, TaskLogSerializer
from .permissions import NotificationPermission, TaskLogPermission


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet للإشعارات"""
    serializer_class = NotificationSerializer
    permission_classes = [NotificationPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """فلترة الإشعارات حسب المستخدم"""
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """تحديد الإشعار كمقروء"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'تم تحديد الإشعار كمقروء'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """تحديد الإشعار كغير مقروء"""
        notification = self.get_object()
        notification.mark_as_unread()
        return Response({'message': 'تم تحديد الإشعار كغير مقروء'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """تحديد جميع الإشعارات كمقروءة"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': 'تم تحديد جميع الإشعارات كمقروءة'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """عدد الإشعارات غير المقروءة"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)


class TaskLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet لسجلات المهام"""
    queryset = TaskLog.objects.all()
    serializer_class = TaskLogSerializer
    permission_classes = [TaskLogPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task', 'user', 'log_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """فلترة السجلات حسب صلاحيات المستخدم"""
        user = self.request.user
        return TaskLog.objects.filter(
            models.Q(task__project__manager=user) | models.Q(task__project__members=user)
        ).distinct() 