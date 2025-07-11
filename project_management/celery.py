import os
from celery import Celery

# تعيين متغير البيئة الافتراضي
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_management.settings')

# إنشاء تطبيق Celery
app = Celery('project_management')

# استخدام إعدادات Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# تحميل المهام تلقائياً من جميع التطبيقات
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    """مهمة اختبار"""
    print(f'Request: {self.request!r}')


# إعدادات إضافية
app.conf.update(
    # إعدادات المهام
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Riyadh',
    enable_utc=True,
    
    # إعدادات الأداء
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
    
    # إعدادات التخطيط
    beat_schedule={
        'check-overdue-tasks': {
            'task': 'tasks.tasks.check_overdue_tasks',
            'schedule': 3600.0,  # كل ساعة
        },
        'send-daily-reports': {
            'task': 'tasks.tasks.send_daily_reports',
            'schedule': 86400.0,  # كل يوم
        },
        'clean-old-notifications': {
            'task': 'notifications.tasks.clean_old_notifications',
            'schedule': 604800.0,  # كل أسبوع
        },
    },
) 