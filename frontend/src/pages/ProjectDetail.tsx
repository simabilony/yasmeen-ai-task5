import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Project, Task, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [newMemberId, setNewMemberId] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as const,
    due_date: ''
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const fetchProjectData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [projectData, tasksData] = await Promise.all([
        api.getProject(parseInt(id)),
        api.getTasks({ project: parseInt(id) })
      ]);
      setProject(projectData);
      setTasks(tasksData.results);
      setEditData({ title: projectData.title, description: projectData.description });
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      const updatedProject = await api.updateProject(project.id, editData);
      setProject(updatedProject);
      setShowEdit(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !window.confirm('هل أنت متأكد من حذف المشروع؟')) return;
    try {
      await api.deleteProject(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newMemberId) return;
    try {
      await api.addProjectMember(project.id, parseInt(newMemberId));
      await fetchProjectData();
      setShowAddMember(false);
      setNewMemberId('');
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!project || !window.confirm('هل أنت متأكد من إزالة العضو؟')) return;
    try {
      await api.removeProjectMember(project.id, memberId);
      await fetchProjectData();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newTask.title.trim()) return;
    try {
      const task = await api.createTask({
        ...newTask,
        project: project.id,
        assignee: parseInt(newTask.assignee)
      });
      setTasks([task, ...tasks]);
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        due_date: ''
      });
    } catch (error) {
      console.error('Failed to add task:', error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center text-gray-500 py-12">المشروع غير موجود</div>;
  }

  const isManager = user?.id === project.manager.id;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          {isManager && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" /> تعديل
              </button>
              <button
                onClick={handleDeleteProject}
                className="btn-danger flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" /> حذف
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4">{project.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>مدير المشروع: {project.manager.first_name} {project.manager.last_name}</span>
          <span>تاريخ الإنشاء: {new Date(project.created_at).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>

      {/* Project Members */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">أعضاء المشروع</h2>
          {isManager && (
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlusIcon className="h-4 w-4" /> إضافة عضو
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{member.first_name} {member.last_name}</div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
              {isManager && member.id !== project.manager.id && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <UserMinusIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Project Tasks */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">مهام المشروع</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" /> مهمة جديدة
          </button>
        </div>
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">لا توجد مهام لهذا المشروع</div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusColor(task.status)}`}>
                      {task.status === 'todo' ? 'قيد الانتظار' : 
                       task.status === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'}
                    </span>
                    <span className={`badge ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'urgent' ? 'عاجل' :
                       task.priority === 'high' ? 'عالي' :
                       task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>المكلف: {task.assignee.first_name} {task.assignee.last_name}</span>
                  <Link to={`/tasks/${task.id}`} className="text-primary-600 hover:text-primary-800">
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">تعديل المشروع</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block mb-1">العنوان</label>
                <input
                  type="text"
                  className="input-field"
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">الوصف</label>
                <textarea
                  className="input-field"
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowEdit(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-primary">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">إضافة عضو</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block mb-1">اختر العضو</label>
                <select
                  className="input-field"
                  value={newMemberId}
                  onChange={e => setNewMemberId(e.target.value)}
                  required
                >
                  <option value="">اختر عضواً...</option>
                  {allUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAddMember(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-primary">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
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
                <label className="block mb-1">المكلف</label>
                <select
                  className="input-field"
                  value={newTask.assignee}
                  onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                  required
                >
                  <option value="">اختر مكلفاً...</option>
                  {project.members.map(member => (
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
                <button type="button" className="btn-secondary" onClick={() => setShowAddTask(false)}>
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

export default ProjectDetail; 