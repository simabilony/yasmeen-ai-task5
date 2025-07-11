from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from tasks.models import Task
from comments.models import Comment


class Notification(models.Model):
    """نموذج الإشعار"""
    NOTIFICATION_TYPES = [
        ('task_created', 'تم إنشاء مهمة جديدة'),
        ('task_updated', 'تم تحديث مهمة'),
        ('task_assigned', 'تم تكليفك بمهمة'),
        ('comment_added', 'تم إضافة تعليق جديد'),
        ('task_followed', 'تم متابعة مهمة'),
        ('task_completed', 'تم إكمال مهمة'),
    ]
    
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name="المستقبل"
    )
    notification_type = models.CharField(
        max_length=20, 
        choices=NOTIFICATION_TYPES,
        verbose_name="نوع الإشعار"
    )
    title = models.CharField(max_length=200, verbose_name="عنوان الإشعار")
    message = models.TextField(verbose_name="رسالة الإشعار")
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications',
        verbose_name="المهمة المرتبطة"
    )
    comment = models.ForeignKey(
        Comment, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications',
        verbose_name="التعليق المرتبط"
    )
    is_read = models.BooleanField(default=False, verbose_name="مقروء")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    
    class Meta:
        verbose_name = "إشعار"
        verbose_name_plural = "الإشعارات"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"إشعار لـ {self.recipient.username}: {self.title}"
    
    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        self.is_read = True
        self.save()
    
    def mark_as_unread(self):
        """تحديد الإشعار كغير مقروء"""
        self.is_read = False
        self.save()


class TaskLog(models.Model):
    """سجل تغييرات المهام"""
    LOG_TYPES = [
        ('status_changed', 'تغيير الحالة'),
        ('assignee_changed', 'تغيير المكلف'),
        ('description_changed', 'تغيير الوصف'),
        ('priority_changed', 'تغيير الأولوية'),
        ('due_date_changed', 'تغيير تاريخ التسليم'),
        ('pinned', 'تثبيت المهمة'),
        ('unpinned', 'إلغاء تثبيت المهمة'),
    ]
    
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='logs',
        verbose_name="المهمة"
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='task_logs',
        verbose_name="المستخدم"
    )
    log_type = models.CharField(
        max_length=20, 
        choices=LOG_TYPES,
        verbose_name="نوع التغيير"
    )
    old_value = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        verbose_name="القيمة القديمة"
    )
    new_value = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        verbose_name="القيمة الجديدة"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ التغيير")
    
    class Meta:
        verbose_name = "سجل مهمة"
        verbose_name_plural = "سجلات المهام"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"تغيير في {self.task.title} بواسطة {self.user.username}" 