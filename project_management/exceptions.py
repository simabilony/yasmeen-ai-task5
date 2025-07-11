from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import Http404
from rest_framework.exceptions import PermissionDenied, NotAuthenticated


def custom_exception_handler(exc, context):
    """معالج الأخطاء المخصص"""
    
    # استدعاء المعالج الافتراضي أولاً
    response = exception_handler(exc, context)
    
    if response is not None:
        # تخصيص رسائل الأخطاء
        if isinstance(exc, NotAuthenticated):
            response.data = {
                'error': 'غير مصرح',
                'message': 'يجب تسجيل الدخول للوصول لهذا المورد',
                'code': 'authentication_required'
            }
        elif isinstance(exc, PermissionDenied):
            response.data = {
                'error': 'ممنوع',
                'message': 'ليس لديك صلاحية للوصول لهذا المورد',
                'code': 'permission_denied'
            }
        elif isinstance(exc, ValidationError):
            response.data = {
                'error': 'بيانات غير صحيحة',
                'message': 'البيانات المرسلة غير صحيحة',
                'details': response.data,
                'code': 'validation_error'
            }
        elif isinstance(exc, Http404):
            response.data = {
                'error': 'غير موجود',
                'message': 'المورد المطلوب غير موجود',
                'code': 'not_found'
            }
        else:
            response.data = {
                'error': 'خطأ في الخادم',
                'message': 'حدث خطأ غير متوقع',
                'code': 'server_error'
            }
    
    return response


class ProjectNotFoundError(Exception):
    """خطأ المشروع غير موجود"""
    pass


class TaskNotFoundError(Exception):
    """خطأ المهمة غير موجودة"""
    pass


class UserNotProjectMemberError(Exception):
    """خطأ المستخدم ليس عضو في المشروع"""
    pass


class UserNotTaskAssigneeError(Exception):
    """خطأ المستخدم ليس مكلف بالمهمة"""
    pass


class CommentNotFoundError(Exception):
    """خطأ التعليق غير موجود"""
    pass


class NotificationNotFoundError(Exception):
    """خطأ الإشعار غير موجود"""
    pass 