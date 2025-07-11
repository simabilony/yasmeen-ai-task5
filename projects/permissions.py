from rest_framework import permissions


class ProjectPermission(permissions.BasePermission):
    """صلاحيات المشاريع"""
    
    def has_permission(self, request, view):
        """التحقق من الصلاحيات العامة"""
        if request.method == 'GET':
            return request.user.is_authenticated
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """التحقق من صلاحيات الكائن المحدد"""
        # القراءة: مدير المشروع أو الأعضاء
        if request.method in permissions.SAFE_METHODS:
            return obj.is_user_member(request.user)
        
        # التحديث والحذف: مدير المشروع فقط
        return obj.is_user_manager(request.user)


class ProjectMemberPermission(permissions.BasePermission):
    """صلاحيات أعضاء المشروع"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.is_user_member(request.user) 