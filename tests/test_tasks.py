from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from projects.models import Project
from tasks.models import Task, TaskFollower


class TaskModelTest(TestCase):
    """اختبارات نموذج المهمة"""
    
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
    
    def test_task_creation(self):
        """اختبار إنشاء مهمة"""
        self.assertEqual(self.task.title, 'مهمة اختبارية')
        self.assertEqual(self.task.assignee, self.user2)
        self.assertEqual(self.task.created_by, self.user1)
        self.assertEqual(self.task.status, 'todo')
    
    def test_task_permissions(self):
        """اختبار صلاحيات المهمة"""
        self.assertTrue(self.task.is_user_assigned(self.user2))
        self.assertTrue(self.task.is_user_creator(self.user1))
        self.assertTrue(self.task.is_user_project_manager(self.user1))
        self.assertTrue(self.task.can_user_edit(self.user1))
        self.assertTrue(self.task.can_user_edit(self.user2))
        
        user3 = User.objects.create_user(
            username='user3',
            email='user3@test.com',
            password='testpass123'
        )
        self.assertFalse(self.task.can_user_edit(user3))


class TaskAPITest(APITestCase):
    """اختبارات API المهام"""
    
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
    
    def test_create_task(self):
        """اختبار إنشاء مهمة عبر API"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'مهمة جديدة',
            'description': 'وصف المهمة الجديدة',
            'project': self.project.id,
            'assignee': self.user2.id,
            'priority': 'high'
        }
        response = self.client.post('/api/tasks/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 2)
    
    def test_task_filtering(self):
        """اختبار فلترة المهام"""
        self.client.force_authenticate(user=self.user1)
        
        # فلترة حسب الحالة
        response = self.client.get('/api/tasks/?status=todo')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # فلترة حسب المكلف
        response = self.client.get(f'/api/tasks/?assignee={self.user2.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_task_search(self):
        """اختبار البحث في المهام"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/tasks/?search=اختبارية')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_task_following(self):
        """اختبار متابعة المهام"""
        self.client.force_authenticate(user=self.user1)
        
        # متابعة مهمة
        data = {'task': self.task.id}
        response = self.client.post('/api/tasks/followers/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TaskFollower.objects.count(), 1)
        
        # قائمة المهام المتابعة
        response = self.client.get('/api/tasks/followers/my_followed_tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) 