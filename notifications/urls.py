from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, TaskLogViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')
router.register(r'logs', TaskLogViewSet, basename='task-log')

urlpatterns = [
    path('', include(router.urls)),
] 