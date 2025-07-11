from rest_framework import permissions


class NotificationPermission(permissions.BasePermission):
    """صلاحيات الإشعارات"""
    
    def has_permission(self, request, view):
        """التحقق من الصلاحيات العامة"""
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """التحقق من صلاحيات الكائن المحدد"""
        # الإشعارات خاصة بالمستخدم فقط
        return obj.recipient == request.user


class TaskLogPermission(permissions.BasePermission):
    """صلاحيات سجلات المهام"""
    
    def has_permission(self, request, view):
        """التحقق من الصلاحيات العامة"""
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """التحقق من صلاحيات الكائن المحدد"""
        # القراءة: أعضاء المشروع
        return obj.task.project.is_user_member(request.user) 