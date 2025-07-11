from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from tasks.models import Task


class Comment(models.Model):
    """نموذج التعليق"""
    content = models.TextField(verbose_name="محتوى التعليق")
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name="كاتب التعليق"
    )
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name="المهمة"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    
    class Meta:
        verbose_name = "تعليق"
        verbose_name_plural = "التعليقات"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"تعليق من {self.author.username} على {self.task.title}"
    
    def is_author(self, user):
        """التحقق من كون المستخدم كاتب التعليق"""
        return self.author == user
    
    def can_user_edit(self, user):
        """التحقق من إمكانية تعديل التعليق"""
        return self.is_author(user) 