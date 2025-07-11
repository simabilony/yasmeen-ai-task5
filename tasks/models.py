from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from projects.models import Project


class Task(models.Model):
    """نموذج المهمة"""
    STATUS_CHOICES = [
        ('todo', 'قيد الانتظار'),
        ('in_progress', 'قيد التنفيذ'),
        ('done', 'مكتمل'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'منخفض'),
        ('medium', 'متوسط'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="عنوان المهمة")
    description = models.TextField(verbose_name="وصف المهمة")
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='tasks',
        verbose_name="المشروع"
    )
    assignee = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks',
        verbose_name="المكلف بالمهمة"
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_tasks',
        verbose_name="أنشئ بواسطة"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='todo',
        verbose_name="حالة المهمة"
    )
    priority = models.CharField(
        max_length=20, 
        choices=PRIORITY_CHOICES, 
        default='medium',
        verbose_name="أولوية المهمة"
    )
    due_date = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="تاريخ التسليم"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    is_pinned = models.BooleanField(default=False, verbose_name="مثبت")
    
    class Meta:
        verbose_name = "مهمة"
        verbose_name_plural = "المهام"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.project.title}"
    
    def is_user_assigned(self, user):
        """التحقق من كون المستخدم مكلف بالمهمة"""
        return self.assignee == user
    
    def is_user_creator(self, user):
        """التحقق من كون المستخدم منشئ المهمة"""
        return self.created_by == user
    
    def is_user_project_manager(self, user):
        """التحقق من كون المستخدم مدير المشروع"""
        return self.project.is_user_manager(user)
    
    def can_user_edit(self, user):
        """التحقق من إمكانية تعديل المهمة"""
        return (
            self.is_user_assigned(user) or 
            self.is_user_creator(user) or 
            self.is_user_project_manager(user)
        )


class TaskFollower(models.Model):
    """نموذج متابعي المهام"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='followed_tasks',
        verbose_name="المستخدم"
    )
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='followers',
        verbose_name="المهمة"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ المتابعة")
    
    class Meta:
        verbose_name = "متابع مهمة"
        verbose_name_plural = "متابعو المهام"
        unique_together = ['user', 'task']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} يتابع {self.task.title}" 