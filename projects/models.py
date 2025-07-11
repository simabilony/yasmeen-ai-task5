from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Project(models.Model):
    """نموذج المشروع"""
    title = models.CharField(max_length=200, verbose_name="عنوان المشروع")
    description = models.TextField(verbose_name="وصف المشروع")
    manager = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='managed_projects',
        verbose_name="مدير المشروع"
    )
    members = models.ManyToManyField(
        User, 
        related_name='member_projects',
        verbose_name="أعضاء المشروع"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    class Meta:
        verbose_name = "مشروع"
        verbose_name_plural = "المشاريع"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def get_member_count(self):
        """عدد أعضاء المشروع"""
        return self.members.count()
    
    def is_user_member(self, user):
        """التحقق من كون المستخدم عضو في المشروع"""
        return user == self.manager or user in self.members.all()
    
    def is_user_manager(self, user):
        """التحقق من كون المستخدم مدير المشروع"""
        return user == self.manager 