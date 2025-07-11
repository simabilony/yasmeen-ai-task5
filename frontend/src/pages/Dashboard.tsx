import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Project, Task } from '../types';
import { 
  FolderIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    pinnedTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch projects and tasks in parallel
        const [projectsResponse, tasksResponse, myProjects, myTasks, overdueTasks, pinnedTasks] = await Promise.all([
          api.getProjects({ page_size: 5 }),
          api.getTasks({ page_size: 5 }),
          api.getMyProjects(),
          api.getMyTasks(),
          api.getOverdueTasks(),
          api.getPinnedTasks(),
        ]);

        setRecentProjects(projectsResponse.results);
        setRecentTasks(tasksResponse.results);
        
        setStats({
          totalProjects: projectsResponse.count,
          totalTasks: tasksResponse.count,
          completedTasks: myTasks.filter(task => task.status === 'done').length,
          overdueTasks: overdueTasks.length,
          pinnedTasks: pinnedTasks.length,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          مرحباً، {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-gray-600 mt-2">
          إليك نظرة عامة على مشاريعك ومهامك
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المشاريع</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المهام</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المهام المكتملة</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المهام المتأخرة</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overdueTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المهام المثبتة</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pinnedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">المشاريع الحديثة</h3>
              <Link
                to="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                عرض الكل
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد مشاريع حديثة</p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FolderIcon className="h-5 w-5 text-blue-600 ml-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-500">{project.manager.first_name} {project.manager.last_name}</p>
                      </div>
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      عرض
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">المهام الحديثة</h3>
              <Link
                to="/tasks"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                عرض الكل
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد مهام حديثة</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 ml-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <div className="flex items-center mt-1 space-x-2 space-x-reverse">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status === 'todo' ? 'قيد الانتظار' : 
                             task.status === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'urgent' ? 'عاجل' :
                             task.priority === 'high' ? 'عالي' :
                             task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      عرض
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 