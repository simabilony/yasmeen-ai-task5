from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from projects.models import Project


class ProjectModelTest(TestCase):
    """اختبارات نموذج المشروع"""
    
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
    
    def test_project_creation(self):
        """اختبار إنشاء مشروع"""
        self.assertEqual(self.project.title, 'مشروع اختباري')
        self.assertEqual(self.project.manager, self.user1)
        self.assertEqual(self.project.get_member_count(), 2)
    
    def test_user_membership(self):
        """اختبار عضوية المستخدم"""
        self.assertTrue(self.project.is_user_member(self.user1))
        self.assertTrue(self.project.is_user_member(self.user2))
        
        user3 = User.objects.create_user(
            username='user3',
            email='user3@test.com',
            password='testpass123'
        )
        self.assertFalse(self.project.is_user_member(user3))
    
    def test_user_manager(self):
        """اختبار مدير المشروع"""
        self.assertTrue(self.project.is_user_manager(self.user1))
        self.assertFalse(self.project.is_user_manager(self.user2))


class ProjectAPITest(APITestCase):
    """اختبارات API المشاريع"""
    
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
    
    def test_create_project(self):
        """اختبار إنشاء مشروع عبر API"""
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'مشروع جديد',
            'description': 'وصف المشروع الجديد',
            'members': [self.user2.id]
        }
        response = self.client.post('/api/projects/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 2)
    
    def test_list_projects(self):
        """اختبار قائمة المشاريع"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_project_permissions(self):
        """اختبار صلاحيات المشروع"""
        user3 = User.objects.create_user(
            username='user3',
            email='user3@test.com',
            password='testpass123'
        )
        
        # المستخدم غير العضو لا يمكنه الوصول للمشروع
        self.client.force_authenticate(user=user3)
        response = self.client.get(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # مدير المشروع يمكنه تحديث المشروع
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'مشروع محدث'}
        response = self.client.patch(f'/api/projects/{self.project.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # العضو العادي لا يمكنه تحديث المشروع
        self.project.members.add(self.user2)
        self.client.force_authenticate(user=self.user2)
        data = {'title': 'مشروع محدث من العضو'}
        response = self.client.patch(f'/api/projects/{self.project.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 