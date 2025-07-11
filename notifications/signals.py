from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from tasks.models import Task, TaskFollower
from comments.models import Comment
from .models import Notification, TaskLog


@receiver(post_save, sender=Task)
def create_task_notifications(sender, instance, created, **kwargs):
    """إنشاء إشعارات عند إنشاء أو تحديث مهمة"""
    if created:
        # إشعار للمكلف بالمهمة
        if instance.assignee:
            Notification.objects.create(
                recipient=instance.assignee,
                notification_type='task_assigned',
                title='تم تكليفك بمهمة جديدة',
                message=f'تم تكليفك بالمهمة: {instance.title}',
                task=instance
            )
        
        # إشعار لمتابعي المشروع
        for follower in instance.project.members.all():
            if follower != instance.assignee and follower != instance.created_by:
                Notification.objects.create(
                    recipient=follower,
                    notification_type='task_created',
                    title='تم إنشاء مهمة جديدة',
                    message=f'تم إنشاء مهمة جديدة في المشروع: {instance.title}',
                    task=instance
                )
    else:
        # تسجيل التغييرات
        if instance.tracker.has_changed('status'):
            old_status = instance.tracker.previous('status')
            new_status = instance.status
            TaskLog.objects.create(
                task=instance,
                user=instance.created_by,
                log_type='status_changed',
                old_value=old_status,
                new_value=new_status
            )
            
            # إشعار للمكلف والمتابعين
            if instance.assignee:
                Notification.objects.create(
                    recipient=instance.assignee,
                    notification_type='task_updated',
                    title='تم تحديث مهمة',
                    message=f'تم تحديث حالة المهمة: {instance.title} من {old_status} إلى {new_status}',
                    task=instance
                )
        
        if instance.tracker.has_changed('assignee'):
            old_assignee = instance.tracker.previous('assignee')
            new_assignee = instance.assignee
            
            TaskLog.objects.create(
                task=instance,
                user=instance.created_by,
                log_type='assignee_changed',
                old_value=str(old_assignee) if old_assignee else 'غير محدد',
                new_value=str(new_assignee) if new_assignee else 'غير محدد'
            )
            
            # إشعار للمكلف الجديد
            if new_assignee:
                Notification.objects.create(
                    recipient=new_assignee,
                    notification_type='task_assigned',
                    title='تم تكليفك بمهمة',
                    message=f'تم تكليفك بالمهمة: {instance.title}',
                    task=instance
                )


@receiver(post_save, sender=Comment)
def create_comment_notifications(sender, instance, created, **kwargs):
    """إنشاء إشعارات عند إضافة تعليق"""
    if created:
        # إشعار لصاحب المهمة
        if instance.task.assignee and instance.task.assignee != instance.author:
            Notification.objects.create(
                recipient=instance.task.assignee,
                notification_type='comment_added',
                title='تعليق جديد على مهمتك',
                message=f'تم إضافة تعليق جديد على المهمة: {instance.task.title}',
                task=instance.task,
                comment=instance
            )
        
        # إشعار لمدير المشروع
        if instance.task.project.manager != instance.author:
            Notification.objects.create(
                recipient=instance.task.project.manager,
                notification_type='comment_added',
                title='تعليق جديد على مهمة',
                message=f'تم إضافة تعليق جديد على المهمة: {instance.task.title}',
                task=instance.task,
                comment=instance
            )
        
        # إشعار للمتابعين
        for follower in instance.task.followers.all():
            if follower.user != instance.author:
                Notification.objects.create(
                    recipient=follower.user,
                    notification_type='comment_added',
                    title='تعليق جديد على مهمة متابعة',
                    message=f'تم إضافة تعليق جديد على المهمة: {instance.task.title}',
                    task=instance.task,
                    comment=instance
                )


@receiver(post_save, sender=TaskFollower)
def create_follow_notifications(sender, instance, created, **kwargs):
    """إنشاء إشعارات عند متابعة مهمة"""
    if created:
        # إشعار لصاحب المهمة
        if instance.task.assignee and instance.task.assignee != instance.user:
            Notification.objects.create(
                recipient=instance.task.assignee,
                notification_type='task_followed',
                title='متابعة جديدة لمهمتك',
                message=f'بدأ {instance.user.username} متابعة مهمتك: {instance.task.title}',
                task=instance.task
            )


@receiver(post_save, sender=Task)
def log_task_changes(sender, instance, created, **kwargs):
    """تسجيل تغييرات المهمة"""
    if not created:
        # تسجيل تغيير الوصف
        if hasattr(instance, 'tracker') and instance.tracker.has_changed('description'):
            TaskLog.objects.create(
                task=instance,
                user=instance.created_by,
                log_type='description_changed',
                old_value=instance.tracker.previous('description')[:100] + '...' if len(instance.tracker.previous('description')) > 100 else instance.tracker.previous('description'),
                new_value=instance.description[:100] + '...' if len(instance.description) > 100 else instance.description
            )
        
        # تسجيل تغيير الأولوية
        if hasattr(instance, 'tracker') and instance.tracker.has_changed('priority'):
            TaskLog.objects.create(
                task=instance,
                user=instance.created_by,
                log_type='priority_changed',
                old_value=instance.tracker.previous('priority'),
                new_value=instance.priority
            )
        
        # تسجيل تغيير تاريخ التسليم
        if hasattr(instance, 'tracker') and instance.tracker.has_changed('due_date'):
            old_date = instance.tracker.previous('due_date')
            new_date = instance.due_date
            TaskLog.objects.create(
                task=instance,
                user=instance.created_by,
                log_type='due_date_changed',
                old_value=str(old_date) if old_date else 'غير محدد',
                new_value=str(new_date) if new_date else 'غير محدد'
            )
        
        # تسجيل تثبيت/إلغاء تثبيت المهمة
        if hasattr(instance, 'tracker') and instance.tracker.has_changed('is_pinned'):
            if instance.is_pinned:
                TaskLog.objects.create(
                    task=instance,
                    user=instance.created_by,
                    log_type='pinned',
                    new_value='تم تثبيت المهمة'
                )
            else:
                TaskLog.objects.create(
                    task=instance,
                    user=instance.created_by,
                    log_type='unpinned',
                    new_value='تم إلغاء تثبيت المهمة'
                ) 