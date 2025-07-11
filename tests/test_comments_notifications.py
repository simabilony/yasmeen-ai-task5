from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from projects.models import Project
from tasks.models import Task
from comments.models import Comment
from notifications.models import Notification


class CommentModelTest(TestCase):
    """اختبارات نموذج التعليق"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            title='مشروع اختباري',
            description='وصف المشروع الاختباري',
            manager=self.user1
        )
        self.project.members.add(self.user2)
        
        self.task = Task.objects.create(
            title='مهمة اختبارية',
            description='وصف المهمة الاختبارية',
            project=self.project,
            assignee=self.user2,
            created_by=self.user1
        )
        
        self.comment = Comment.objects.create(
            content='تعليق اختباري',
            author=self.user2,
            task=self.task
        )
    
    def test_comment_creation(self):
        """اختبار إنشاء تعليق"""
        self.assertEqual(self.comment.content, 'تعليق اختباري')
        self.assertEqual(self.comment.author, self.user2)
        self.assertEqual(self.comment.task, self.task)
    
    def test_comment_permissions(self):
        """اختبار صلاحيات التعليق"""
        self.assertTrue(self.comment.is_author(self.user2))
        self.assertTrue(self.comment.can_user_edit(self.user2))
        self.assertFalse(self.comment.can_user_edit(self.user1))


class CommentAPITest(APITestCase):
    """اختبارات API التعليقات"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            title='مشروع اختباري',
            description='وصف المشروع الاختباري',
            manager=self.user1
        )
        self.project.members.add(self.user2)
        
        self.task = Task.objects.create(
            title='مهمة اختبارية',
            description='وصف المهمة الاختبارية',
            project=self.project,
            assignee=self.user2,
            created_by=self.user1
        )
    
    def test_create_comment(self):
        """اختبار إنشاء تعليق عبر API"""
        self.client.force_authenticate(user=self.user2)
        data = {
            'content': 'تعليق جديد',
            'task': self.task.id
        }
        response = self.client.post('/api/comments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
    
    def test_comment_permissions(self):
        """اختبار صلاحيات التعليقات"""
        comment = Comment.objects.create(
            content='تعليق اختباري',
            author=self.user2,
            task=self.task
        )
        
        # كاتب التعليق يمكنه تعديله
        self.client.force_authenticate(user=self.user2)
        data = {'content': 'تعليق محدث'}
        response = self.client.put(f'/api/comments/{comment.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # مستخدم آخر لا يمكنه تعديل التعليق
        self.client.force_authenticate(user=self.user1)
        data = {'content': 'تعليق محدث من مستخدم آخر'}
        response = self.client.put(f'/api/comments/{comment.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class NotificationModelTest(TestCase):
    """اختبارات نموذج الإشعار"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            title='مشروع اختباري',
            description='وصف المشروع الاختباري',
            manager=self.user1
        )
        
        self.task = Task.objects.create(
            title='مهمة اختبارية',
            description='وصف المهمة الاختبارية',
            project=self.project,
            assignee=self.user2,
            created_by=self.user1
        )
        
        self.notification = Notification.objects.create(
            recipient=self.user2,
            notification_type='task_assigned',
            title='تم تكليفك بمهمة جديدة',
            message='تم تكليفك بالمهمة: مهمة اختبارية',
            task=self.task
        )
    
    def test_notification_creation(self):
        """اختبار إنشاء إشعار"""
        self.assertEqual(self.notification.recipient, self.user2)
        self.assertEqual(self.notification.notification_type, 'task_assigned')
        self.assertFalse(self.notification.is_read)
    
    def test_mark_as_read(self):
        """اختبار تحديد الإشعار كمقروء"""
        self.notification.mark_as_read()
        self.assertTrue(self.notification.is_read)
    
    def test_mark_as_unread(self):
        """اختبار تحديد الإشعار كغير مقروء"""
        self.notification.mark_as_read()
        self.notification.mark_as_unread()
        self.assertFalse(self.notification.is_read)


class NotificationAPITest(APITestCase):
    """اختبارات API الإشعارات"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            title='مشروع اختباري',
            description='وصف المشروع الاختباري',
            manager=self.user1
        )
        
        self.task = Task.objects.create(
            title='مهمة اختبارية',
            description='وصف المهمة الاختبارية',
            project=self.project,
            assignee=self.user2,
            created_by=self.user1
        )
        
        self.notification = Notification.objects.create(
            recipient=self.user2,
            notification_type='task_assigned',
            title='تم تكليفك بمهمة جديدة',
            message='تم تكليفك بالمهمة: مهمة اختبارية',
            task=self.task
        )
    
    def test_list_notifications(self):
        """اختبار قائمة الإشعارات"""
        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_mark_notification_as_read(self):
        """اختبار تحديد الإشعار كمقروء"""
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/notifications/{self.notification.id}/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # التحقق من تحديث الحالة
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
    
    def test_unread_count(self):
        """اختبار عداد الإشعارات غير المقروءة"""
        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 1)
        
        # تحديد الإشعار كمقروء
        self.notification.mark_as_read()
        response = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(response.data['unread_count'], 0)
    
    def test_notification_permissions(self):
        """اختبار صلاحيات الإشعارات"""
        # المستخدم لا يمكنه الوصول لإشعارات مستخدم آخر
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/notifications/{self.notification.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) 