import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Task, Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project: '',
    assignee: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'medium' as const,
    due_date: ''
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.project) params.project = filters.project;
      if (filters.assignee) params.assignee = filters.assignee;
      
      const response = await api.getTasks(params);
      setTasks(response.results);
    } catch (err) {
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.getProjects();
      setProjects(response.results);
    } catch (err) {
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [search, filters]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.project || !newTask.assignee) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      const task = await api.createTask({
        ...newTask,
        project: parseInt(newTask.project),
        assignee: parseInt(newTask.assignee)
      });
      setTasks([task, ...tasks]);
      setShowAdd(false);
      setNewTask({
        title: '',
        description: '',
        project: '',
        assignee: '',
        priority: 'medium',
        due_date: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'حدث خطأ أثناء إضافة المهمة');
    }
  };

  const handlePinTask = async (taskId: number, isPinned: boolean) => {
    try {
      if (isPinned) {
        await api.unpinTask(taskId);
      } else {
        await api.pinTask(taskId);
      }
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_pinned: !isPinned } : task
      ));
    } catch (err) {
      console.error('Failed to pin/unpin task:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'قيد الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'done': return 'مكتمل';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">المهام</h2>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <PlusIcon className="h-5 w-5" /> مهمة جديدة
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              className="input-field pr-10"
              placeholder="بحث في المهام..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex gap-2">
            <select
              className="input-field"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">جميع الحالات</option>
              <option value="todo">قيد الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="done">مكتمل</option>
            </select>
            
            <select
              className="input-field"
              value={filters.priority}
              onChange={e => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">جميع الأولويات</option>
              <option value="low">منخفض</option>
              <option value="medium">متوسط</option>
              <option value="high">عالي</option>
              <option value="urgent">عاجل</option>
            </select>
            
            <select
              className="input-field"
              value={filters.project}
              onChange={e => setFilters({ ...filters, project: e.target.value })}
            >
              <option value="">جميع المشاريع</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-12">لا توجد مهام</div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className={`card ${task.is_pinned ? 'border-l-4 border-l-yellow-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    {task.is_pinned && (
                      <span className="text-yellow-600 text-sm">📌 مثبتة</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`badge ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className={`badge ${getPriorityColor(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                    <span className="text-sm text-gray-500">
                      المشروع: {task.project.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      المكلف: {task.assignee.first_name} {task.assignee.last_name}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    تاريخ التسليم: {task.due_date ? new Date(task.due_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePinTask(task.id, task.is_pinned)}
                    className={`p-2 rounded ${task.is_pinned ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                    title={task.is_pinned ? 'إلغاء التثبيت' : 'تثبيت المهمة'}
                  >
                    📌
                  </button>
                  <Link to={`/tasks/${task.id}`} className="btn-secondary">
                    تفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">إضافة مهمة جديدة</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block mb-1">العنوان</label>
                <input
                  type="text"
                  className="input-field"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">الوصف</label>
                <textarea
                  className="input-field"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block mb-1">المشروع</label>
                <select
                  className="input-field"
                  value={newTask.project}
                  onChange={e => setNewTask({ ...newTask, project: e.target.value })}
                  required
                >
                  <option value="">اختر المشروع...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">المكلف</label>
                <select
                  className="input-field"
                  value={newTask.assignee}
                  onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                  required
                >
                  <option value="">اختر المكلف...</option>
                  {projects
                    .find(p => p.id === parseInt(newTask.project))
                    ?.members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">الأولوية</label>
                <select
                  className="input-field"
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                >
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">تاريخ التسليم</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={newTask.due_date}
                  onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-primary">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 