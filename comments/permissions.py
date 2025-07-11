from rest_framework import permissions


class CommentPermission(permissions.BasePermission):
    """صلاحيات التعليقات"""
    
    def has_permission(self, request, view):
        """التحقق من الصلاحيات العامة"""
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """التحقق من صلاحيات الكائن المحدد"""
        # القراءة: أعضاء المشروع
        if request.method in permissions.SAFE_METHODS:
            return obj.task.project.is_user_member(request.user)
        
        # التحديث والحذف: كاتب التعليق فقط
        return obj.can_user_edit(request.user) 