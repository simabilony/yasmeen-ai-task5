from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.utils import timezone
from .models import Task, TaskFollower
from .serializers import (
    TaskSerializer, 
    TaskCreateSerializer, 
    TaskUpdateSerializer,
    TaskFollowerSerializer,
    TaskFollowerCreateSerializer
)
from .permissions import TaskPermission, TaskFollowerPermission


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet للمهام"""
    queryset = Task.objects.all()
    permission_classes = [TaskPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assignee', 'is_pinned']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """فلترة المهام حسب صلاحيات المستخدم"""
        user = self.request.user
        return Task.objects.filter(
            models.Q(project__manager=user) | models.Q(project__members=user)
        ).distinct()
    
    def get_serializer_class(self):
        """اختيار Serializer المناسب"""
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """المهام المكلف بها المستخدم"""
        tasks = self.get_queryset().filter(assignee=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def created_tasks(self, request):
        """المهام التي أنشأها المستخدم"""
        tasks = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue_tasks(self, request):
        """المهام المتأخرة"""
        tasks = self.get_queryset().filter(
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress']
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pinned_tasks(self, request):
        """المهام المثبتة"""
        tasks = self.get_queryset().filter(is_pinned=True)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pin_task(self, request, pk=None):
        """تثبيت مهمة"""
        task = self.get_object()
        task.is_pinned = True
        task.save()
        return Response({'message': 'تم تثبيت المهمة'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def unpin_task(self, request, pk=None):
        """إلغاء تثبيت مهمة"""
        task = self.get_object()
        task.is_pinned = False
        task.save()
        return Response({'message': 'تم إلغاء تثبيت المهمة'}, status=status.HTTP_200_OK)


class TaskFollowerViewSet(viewsets.ModelViewSet):
    """ViewSet لمتابعي المهام"""
    queryset = TaskFollower.objects.all()
    permission_classes = [TaskFollowerPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task', 'user']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """فلترة المتابعين حسب صلاحيات المستخدم"""
        user = self.request.user
        return TaskFollower.objects.filter(
            models.Q(task__project__manager=user) | models.Q(task__project__members=user)
        ).distinct()
    
    def get_serializer_class(self):
        """اختيار Serializer المناسب"""
        if self.action == 'create':
            return TaskFollowerCreateSerializer
        return TaskFollowerSerializer
    
    @action(detail=False, methods=['get'])
    def my_followed_tasks(self, request):
        """المهام التي يتابعها المستخدم"""
        followers = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data) 