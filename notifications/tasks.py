from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, TaskLog
from datetime import timedelta


@shared_task
def clean_old_notifications():
    """تنظيف الإشعارات القديمة"""
    # حذف الإشعارات المقروءة القديمة (أكثر من 30 يوم)
    old_read_notifications = Notification.objects.filter(
        is_read=True,
        created_at__lt=timezone.now() - timedelta(days=30)
    )
    deleted_read = old_read_notifications.count()
    old_read_notifications.delete()
    
    # حذف الإشعارات غير المقروءة القديمة (أكثر من 90 يوم)
    old_unread_notifications = Notification.objects.filter(
        is_read=False,
        created_at__lt=timezone.now() - timedelta(days=90)
    )
    deleted_unread = old_unread_notifications.count()
    old_unread_notifications.delete()
    
    return f"تم حذف {deleted_read} إشعار مقروء قديم و {deleted_unread} إشعار غير مقروء قديم"


@shared_task
def send_notification_email(notification_id):
    """إرسال إشعار بالبريد الإلكتروني"""
    try:
        notification = Notification.objects.get(id=notification_id)
        
        if notification.recipient.email:
            subject = notification.title
            message = f"""
            {notification.message}
            
            نوع الإشعار: {notification.get_notification_type_display()}
            التاريخ: {notification.created_at.strftime('%Y-%m-%d %H:%M')}
            
            يمكنك مراجعة التفاصيل في النظام.
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [notification.recipient.email],
                fail_silently=True,
            )
            
            return f"تم إرسال إشعار بالبريد الإلكتروني: {notification.title}"
    except Notification.DoesNotExist:
        return f"الإشعار {notification_id} غير موجود"


@shared_task
def send_bulk_notifications(notification_type, user_ids, title, message, task_id=None, comment_id=None):
    """إرسال إشعارات جماعية"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    created_notifications = []
    
    for user_id in user_ids:
        try:
            user = User.objects.get(id=user_id)
            notification = Notification.objects.create(
                recipient=user,
                notification_type=notification_type,
                title=title,
                message=message,
                task_id=task_id,
                comment_id=comment_id
            )
            created_notifications.append(notification)
            
            # إرسال بالبريد الإلكتروني إذا كان مطلوباً
            if user.email:
                send_notification_email.delay(notification.id)
                
        except User.DoesNotExist:
            continue
    
    return f"تم إنشاء {len(created_notifications)} إشعار"


@shared_task
def send_weekly_summary():
    """إرسال ملخص أسبوعي"""
    from django.contrib.auth import get_user_model
    from tasks.models import Task
    User = get_user_model()
    
    week_ago = timezone.now() - timedelta(days=7)
    
    for user in User.objects.filter(is_active=True):
        if not user.email:
            continue
            
        # المهام المكتملة هذا الأسبوع
        completed_tasks = Task.objects.filter(
            assignee=user,
            status='done',
            updated_at__gte=week_ago
        )
        
        # المهام الجديدة المكلف بها
        new_assigned_tasks = Task.objects.filter(
            assignee=user,
            created_at__gte=week_ago
        )
        
        # المهام المتأخرة
        overdue_tasks = Task.objects.filter(
            assignee=user,
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress']
        )
        
        # الإشعارات الجديدة
        new_notifications = Notification.objects.filter(
            recipient=user,
            created_at__gte=week_ago,
            is_read=False
        )
        
        if completed_tasks.exists() or new_assigned_tasks.exists() or overdue_tasks.exists():
            subject = 'الملخص الأسبوعي - نظام إدارة المشاريع'
            message = f"""
            الملخص الأسبوعي للمستخدم: {user.get_full_name() or user.username}
            
            المهام المكتملة هذا الأسبوع: {completed_tasks.count()}
            المهام الجديدة المكلف بها: {new_assigned_tasks.count()}
            المهام المتأخرة: {overdue_tasks.count()}
            الإشعارات الجديدة: {new_notifications.count()}
            
            تفاصيل المهام المكتملة:
            {chr(10).join([f'- {task.title} ({task.project.title})' for task in completed_tasks])}
            
            تفاصيل المهام الجديدة:
            {chr(10).join([f'- {task.title} ({task.project.title})' for task in new_assigned_tasks])}
            
            تفاصيل المهام المتأخرة:
            {chr(10).join([f'- {task.title} ({task.project.title})' for task in overdue_tasks])}
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
    
    return "تم إرسال الملخصات الأسبوعية"


@shared_task
def archive_old_logs():
    """أرشفة سجلات التغييرات القديمة"""
    # نقل السجلات القديمة (أكثر من 6 أشهر) إلى جدول الأرشيف
    old_logs = TaskLog.objects.filter(
        created_at__lt=timezone.now() - timedelta(days=180)
    )
    
    archived_count = 0
    for log in old_logs:
        # هنا يمكن حفظ السجل في جدول الأرشيف أو ملف
        # للتبسيط، سنحذف السجلات القديمة
        archived_count += 1
    
    old_logs.delete()
    
    return f"تم أرشفة {archived_count} سجل قديم"


@shared_task
def generate_notification_statistics():
    """توليد إحصائيات الإشعارات"""
    from django.db.models import Count
    from django.core.cache import cache
    
    # إحصائيات حسب النوع
    type_stats = Notification.objects.values('notification_type').annotate(
        count=Count('id')
    )
    
    # إحصائيات حسب الحالة
    read_stats = Notification.objects.values('is_read').annotate(
        count=Count('id')
    )
    
    # إحصائيات حسب المستخدم
    user_stats = Notification.objects.values('recipient__username').annotate(
        total=Count('id'),
        unread=Count('id', filter={'is_read': False})
    ).order_by('-total')[:10]
    
    statistics = {
        'type_stats': list(type_stats),
        'read_stats': list(read_stats),
        'top_users': list(user_stats),
        'total_notifications': Notification.objects.count(),
        'unread_notifications': Notification.objects.filter(is_read=False).count(),
        'generated_at': timezone.now().isoformat()
    }
    
    # حفظ الإحصائيات في التخزين المؤقت
    cache.set('notification_statistics', statistics, 3600)
    
    return "تم توليد إحصائيات الإشعارات" 