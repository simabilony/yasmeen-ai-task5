from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskFollowerViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')
router.register(r'followers', TaskFollowerViewSet, basename='task-follower')

urlpatterns = [
    path('', include(router.urls)),
] 