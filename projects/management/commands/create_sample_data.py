from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from projects.models import Project
from tasks.models import Task, TaskFollower
from comments.models import Comment
from notifications.models import Notification


class Command(BaseCommand):
    help = 'إنشاء بيانات تجريبية للمشروع'

    def handle(self, *args, **options):
        self.stdout.write('بدء إنشاء البيانات التجريبية...')
        
        # إنشاء مستخدمين
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'مدير',
                'last_name': 'النظام',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('تم إنشاء المستخدم المدير')
        
        user1, created = User.objects.get_or_create(
            username='user1',
            defaults={
                'email': 'user1@example.com',
                'first_name': 'أحمد',
                'last_name': 'محمد'
            }
        )
        if created:
            user1.set_password('user123')
            user1.save()
            self.stdout.write('تم إنشاء المستخدم الأول')
        
        user2, created = User.objects.get_or_create(
            username='user2',
            defaults={
                'email': 'user2@example.com',
                'first_name': 'فاطمة',
                'last_name': 'علي'
            }
        )
        if created:
            user2.set_password('user123')
            user2.save()
            self.stdout.write('تم إنشاء المستخدم الثاني')
        
        # إنشاء مشاريع
        project1, created = Project.objects.get_or_create(
            title='مشروع تطوير الموقع',
            defaults={
                'description': 'مشروع تطوير موقع إلكتروني متكامل مع نظام إدارة المحتوى',
                'manager': admin_user
            }
        )
        if created:
            project1.members.add(user1, user2)
            self.stdout.write('تم إنشاء المشروع الأول')
        
        project2, created = Project.objects.get_or_create(
            title='مشروع تطبيق الجوال',
            defaults={
                'description': 'تطوير تطبيق جوال للطلاب مع نظام إدارة المقررات',
                'manager': user1
            }
        )
        if created:
            project2.members.add(admin_user, user2)
            self.stdout.write('تم إنشاء المشروع الثاني')
        
        # إنشاء مهام
        task1, created = Task.objects.get_or_create(
            title='تصميم واجهة المستخدم',
            defaults={
                'description': 'تصميم واجهة مستخدم حديثة وسهلة الاستخدام للموقع',
                'project': project1,
                'assignee': user1,
                'created_by': admin_user,
                'status': 'in_progress',
                'priority': 'high',
                'due_date': timezone.now() + timedelta(days=14),
                'is_pinned': True
            }
        )
        if created:
            self.stdout.write('تم إنشاء المهمة الأولى')
        
        task2, created = Task.objects.get_or_create(
            title='تطوير قاعدة البيانات',
            defaults={
                'description': 'تصميم وتطوير قاعدة البيانات للمشروع',
                'project': project1,
                'assignee': user2,
                'created_by': admin_user,
                'status': 'todo',
                'priority': 'medium',
                'due_date': timezone.now() + timedelta(days=20)
            }
        )
        if created:
            self.stdout.write('تم إنشاء المهمة الثانية')
        
        task3, created = Task.objects.get_or_create(
            title='تطوير واجهة API',
            defaults={
                'description': 'تطوير واجهة برمجة التطبيقات للتطبيق الجوال',
                'project': project2,
                'assignee': admin_user,
                'created_by': user1,
                'status': 'done',
                'priority': 'urgent',
                'due_date': timezone.now() - timedelta(days=5)
            }
        )
        if created:
            self.stdout.write('تم إنشاء المهمة الثالثة')
        
        # إنشاء تعليقات
        comment1, created = Comment.objects.get_or_create(
            content='تم البدء في تصميم الواجهة وسأقدم النتائج قريباً',
            defaults={
                'author': user1,
                'task': task1
            }
        )
        if created:
            self.stdout.write('تم إنشاء التعليق الأول')
        
        comment2, created = Comment.objects.get_or_create(
            content='ممتاز! تأكد من أن التصميم متجاوب مع جميع الأجهزة',
            defaults={
                'author': admin_user,
                'task': task1
            }
        )
        if created:
            self.stdout.write('تم إنشاء التعليق الثاني')
        
        # إنشاء متابعين للمهام
        follower1, created = TaskFollower.objects.get_or_create(
            user=admin_user,
            task=task1
        )
        if created:
            self.stdout.write('تم إنشاء متابع للمهمة الأولى')
        
        follower2, created = TaskFollower.objects.get_or_create(
            user=user2,
            task=task1
        )
        if created:
            self.stdout.write('تم إنشاء متابع آخر للمهمة الأولى')
        
        # إنشاء إشعارات
        notification1, created = Notification.objects.get_or_create(
            recipient=user1,
            notification_type='task_assigned',
            defaults={
                'title': 'تم تكليفك بمهمة جديدة',
                'message': f'تم تكليفك بالمهمة: {task1.title}',
                'task': task1
            }
        )
        if created:
            self.stdout.write('تم إنشاء الإشعار الأول')
        
        notification2, created = Notification.objects.get_or_create(
            recipient=admin_user,
            notification_type='comment_added',
            defaults={
                'title': 'تعليق جديد على مهمة',
                'message': f'تم إضافة تعليق جديد على المهمة: {task1.title}',
                'task': task1,
                'comment': comment1
            }
        )
        if created:
            self.stdout.write('تم إنشاء الإشعار الثاني')
        
        self.stdout.write(
            self.style.SUCCESS('تم إنشاء جميع البيانات التجريبية بنجاح!')
        )
        self.stdout.write(f'تم إنشاء {User.objects.count()} مستخدم')
        self.stdout.write(f'تم إنشاء {Project.objects.count()} مشروع')
        self.stdout.write(f'تم إنشاء {Task.objects.count()} مهمة')
        self.stdout.write(f'تم إنشاء {Comment.objects.count()} تعليق')
        self.stdout.write(f'تم إنشاء {TaskFollower.objects.count()} متابع')
        self.stdout.write(f'تم إنشاء {Notification.objects.count()} إشعار') 