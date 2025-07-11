from rest_framework import permissions


class TaskPermission(permissions.BasePermission):
    """صلاحيات المهام"""
    
    def has_permission(self, request, view):
        """التحقق من الصلاحيات العامة"""
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """التحقق من صلاحيات الكائن المحدد"""
        # القراءة: أعضاء المشروع
        if request.method in permissions.SAFE_METHODS:
            return obj.project.is_user_member(request.user)
        
        # التحديث: المكلف أو المنشئ أو مدير المشروع
        if request.method in ['PUT', 'PATCH']:
            return obj.can_user_edit(request.user)
        
        # الحذف: المنشئ أو مدير المشروع
        if request.method == 'DELETE':
            return (
                obj.is_user_creator(request.user) or 
                obj.is_user_project_manager(request.user)
            )
        
        return False


class TaskFollowerPermission(permissions.BasePermission):
    """صلاحيات متابعي المهام"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # القراءة: أعضاء المشروع
        if request.method in permissions.SAFE_METHODS:
            return obj.task.project.is_user_member(request.user)
        
        # الحذف: صاحب المتابعة
        if request.method == 'DELETE':
            return obj.user == request.user
        
        return False 