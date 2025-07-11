from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Task
from notifications.models import Notification
from datetime import timedelta


@shared_task
def check_overdue_tasks():
    """فحص المهام المتأخرة وإرسال إشعارات"""
    overdue_tasks = Task.objects.filter(
        due_date__lt=timezone.now(),
        status__in=['todo', 'in_progress']
    )
    
    for task in overdue_tasks:
        # إنشاء إشعار للمكلف
        if task.assignee:
            Notification.objects.create(
                recipient=task.assignee,
                notification_type='task_overdue',
                title='مهمة متأخرة',
                message=f'المهمة "{task.title}" متأخرة عن موعدها المحدد',
                task=task
            )
        
        # إنشاء إشعار للمتابعين
        for follower in task.followers.all():
            Notification.objects.create(
                recipient=follower,
                notification_type='task_overdue',
                title='مهمة متأخرة',
                message=f'المهمة "{task.title}" متأخرة عن موعدها المحدد',
                task=task
            )
    
    return f"تم فحص {overdue_tasks.count()} مهمة متأخرة"


@shared_task
def send_daily_reports():
    """إرسال التقارير اليومية"""
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    # المهام المكتملة أمس
    completed_tasks = Task.objects.filter(
        status='done',
        updated_at__date=yesterday
    )
    
    # المهام الجديدة أمس
    new_tasks = Task.objects.filter(
        created_at__date=yesterday
    )
    
    # إرسال تقرير للمديرين
    for project in set([task.project for task in completed_tasks] + [task.project for task in new_tasks]):
        if project.manager.email:
            subject = f'التقرير اليومي - {project.title}'
            message = f"""
            تقرير يوم {yesterday}:
            
            المهام المكتملة: {completed_tasks.filter(project=project).count()}
            المهام الجديدة: {new_tasks.filter(project=project).count()}
            
            تفاصيل المهام المكتملة:
            {chr(10).join([f'- {task.title}' for task in completed_tasks.filter(project=project)])}
            
            تفاصيل المهام الجديدة:
            {chr(10).join([f'- {task.title}' for task in new_tasks.filter(project=project)])}
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [project.manager.email],
                fail_silently=True,
            )
    
    return f"تم إرسال {len(set([task.project for task in completed_tasks] + [task.project for task in new_tasks]))} تقرير يومي"


@shared_task
def send_task_reminder(task_id):
    """إرسال تذكير بمهمة"""
    try:
        task = Task.objects.get(id=task_id)
        
        if task.assignee and task.assignee.email:
            subject = f'تذكير بالمهمة: {task.title}'
            message = f"""
            تذكير بالمهمة:
            
            العنوان: {task.title}
            الوصف: {task.description}
            الأولوية: {task.get_priority_display()}
            تاريخ التسليم: {task.due_date.strftime('%Y-%m-%d')}
            المشروع: {task.project.title}
            
            يرجى مراجعة المهمة والتأكد من إكمالها في الوقت المحدد.
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [task.assignee.email],
                fail_silently=True,
            )
            
            return f"تم إرسال تذكير للمهمة {task.title}"
    except Task.DoesNotExist:
        return f"المهمة {task_id} غير موجودة"


@shared_task
def update_task_statistics():
    """تحديث إحصائيات المهام"""
    from django.db.models import Count, Q
    
    # إحصائيات عامة
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(status='done').count()
    overdue_tasks = Task.objects.filter(
        due_date__lt=timezone.now(),
        status__in=['todo', 'in_progress']
    ).count()
    
    # إحصائيات حسب المشروع
    project_stats = Task.objects.values('project__title').annotate(
        total=Count('id'),
        completed=Count('id', filter=Q(status='done')),
        overdue=Count('id', filter=Q(due_date__lt=timezone.now(), status__in=['todo', 'in_progress']))
    )
    
    # حفظ الإحصائيات في التخزين المؤقت أو قاعدة البيانات
    from django.core.cache import cache
    
    cache.set('task_statistics', {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'overdue_tasks': overdue_tasks,
        'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        'project_stats': list(project_stats)
    }, 3600)  # تخزين لمدة ساعة
    
    return "تم تحديث إحصائيات المهام"


@shared_task
def cleanup_old_data():
    """تنظيف البيانات القديمة"""
    from datetime import datetime, timedelta
    
    # حذف الإشعارات القديمة (أكثر من 30 يوم)
    old_notifications = Notification.objects.filter(
        created_at__lt=timezone.now() - timedelta(days=30)
    )
    deleted_notifications = old_notifications.count()
    old_notifications.delete()
    
    # حذف سجلات التغييرات القديمة (أكثر من 90 يوم)
    from notifications.models import TaskLog
    old_logs = TaskLog.objects.filter(
        created_at__lt=timezone.now() - timedelta(days=90)
    )
    deleted_logs = old_logs.count()
    old_logs.delete()
    
    return f"تم حذف {deleted_notifications} إشعار قديم و {deleted_logs} سجل قديم" 