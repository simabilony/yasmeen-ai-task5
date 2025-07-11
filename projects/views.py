from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db import models
from .models import Project
from .serializers import (
    ProjectSerializer, 
    ProjectCreateSerializer, 
    ProjectUpdateSerializer,
    UserSerializer
)
from .permissions import ProjectPermission, ProjectMemberPermission


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet للمشاريع"""
    queryset = Project.objects.all()
    permission_classes = [ProjectPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'manager']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """فلترة المشاريع حسب صلاحيات المستخدم"""
        user = self.request.user
        return Project.objects.filter(
            models.Q(manager=user) | models.Q(members=user)
        ).distinct()
    
    def get_serializer_class(self):
        """اختيار Serializer المناسب"""
        if self.action == 'create':
            return ProjectCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProjectUpdateSerializer
        return ProjectSerializer
    
    def perform_update(self, serializer):
        """تحديث المشروع مع الحفاظ على المدير"""
        project = serializer.save()
        # إضافة المدير كعضو إذا لم يكن موجوداً
        if project.manager not in project.members.all():
            project.members.add(project.manager)
    
    @action(detail=True, methods=['post'], permission_classes=[ProjectMemberPermission])
    def add_member(self, request, pk=None):
        """إضافة عضو للمشروع"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response({'message': 'تم إضافة العضو بنجاح'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[ProjectPermission])
    def remove_member(self, request, pk=None):
        """إزالة عضو من المشروع"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            if user == project.manager:
                return Response({'error': 'لا يمكن إزالة مدير المشروع'}, status=status.HTTP_400_BAD_REQUEST)
            
            project.members.remove(user)
            return Response({'message': 'تم إزالة العضو بنجاح'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """المشاريع التي يديرها المستخدم"""
        projects = Project.objects.filter(manager=request.user)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def member_projects(self, request):
        """المشاريع التي يشارك فيها المستخدم كعضو"""
        projects = Project.objects.filter(members=request.user).exclude(manager=request.user)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data) 