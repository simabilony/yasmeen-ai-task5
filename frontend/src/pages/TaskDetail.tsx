import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Task, Comment, TaskLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  PencilIcon, 
  TrashIcon, 
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    due_date: ''
  });
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fetchTaskData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [taskData, commentsData, logsData] = await Promise.all([
        api.getTask(parseInt(id)),
        api.getComments({ task: parseInt(id) }),
        api.getTaskLogs({ task: parseInt(id) })
      ]);
      setTask(taskData);
      setComments(commentsData.results);
      setLogs(logsData.results);
      setEditData({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.due_date ? taskData.due_date.slice(0, 16) : ''
      });
    } catch (error) {
      console.error('Failed to fetch task data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      const updatedTask = await api.updateTask(task.id, editData);
      setTask(updatedTask);
      setShowEdit(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !window.confirm('هل أنت متأكد من حذف المهمة؟')) return;
    try {
      await api.deleteTask(task.id);
      // Redirect to tasks list
      window.location.href = '/tasks';
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    try {
      const comment = await api.createComment({
        content: newComment,
        task: task.id
      });
      setComments([comment, ...comments]);
      setNewComment('');
      setShowAddComment(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    try {
      const updatedComment = await api.updateComment(commentId, {
        content: editCommentText
      });
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingComment(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف التعليق؟')) return;
    try {
      await api.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleFollowTask = async () => {
    if (!task) return;
    try {
      if (isFollowing) {
        // Find and remove follower
        const followers = await api.getTaskFollowers({ task: task.id });
        const myFollower = followers.results.find(f => f.user.id === user?.id);
        if (myFollower) {
          await api.unfollowTask(myFollower.id);
        }
      } else {
        await api.followTask(task.id);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow/unfollow task:', error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return <div className="text-center text-gray-500 py-12">المهمة غير موجودة</div>;
  }

  const canEdit = user?.id === task.assignee.id || user?.id === task.project.manager.id;
  const canDelete = user?.id === task.project.manager.id;

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              {task.is_pinned && (
                <span className="text-yellow-600 text-sm">📌 مثبتة</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{task.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`badge ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </span>
              <span className={`badge ${getPriorityColor(task.priority)}`}>
                {getPriorityText(task.priority)}
              </span>
              <span className="text-sm text-gray-500">
                المشروع: <Link to={`/projects/${task.project.id}`} className="text-primary-600 hover:text-primary-800">
                  {task.project.title}
                </Link>
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
              onClick={handleFollowTask}
              className={`btn-secondary flex items-center gap-2 ${isFollowing ? 'bg-primary-100 text-primary-800' : ''}`}
            >
              <EyeIcon className="h-4 w-4" />
              {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
            </button>
            {canEdit && (
              <button
                onClick={() => setShowEdit(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" /> تعديل
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDeleteTask}
                className="btn-danger flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" /> حذف
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">سجل التغييرات</h2>
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    تم تغيير <span className="font-medium">{log.field_name}</span> من 
                    <span className="font-medium"> {log.old_value}</span> إلى 
                    <span className="font-medium"> {log.new_value}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    بواسطة {log.changed_by.first_name} {log.changed_by.last_name} - 
                    {new Date(log.changed_at).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            التعليقات ({comments.length})
          </h2>
          <button
            onClick={() => setShowAddComment(true)}
            className="btn-primary"
          >
            إضافة تعليق
          </button>
        </div>
        
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">لا توجد تعليقات</div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.author.first_name} {comment.author.last_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  {user?.id === comment.author.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditCommentText(comment.content);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>
                
                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="input-field"
                      value={editCommentText}
                      onChange={e => setEditCommentText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="btn-secondary text-sm"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        className="btn-primary text-sm"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{comment.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">تعديل المهمة</h3>
            <form onSubmit={handleUpdateTask} className="space-y-4">
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
              
              <div>
                <label className="block mb-1">الحالة</label>
                <select
                  className="input-field"
                  value={editData.status}
                  onChange={e => setEditData({ ...editData, status: e.target.value as any })}
                >
                  <option value="todo">قيد الانتظار</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="done">مكتمل</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">الأولوية</label>
                <select
                  className="input-field"
                  value={editData.priority}
                  onChange={e => setEditData({ ...editData, priority: e.target.value as any })}
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
                  value={editData.due_date}
                  onChange={e => setEditData({ ...editData, due_date: e.target.value })}
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

      {/* Add Comment Modal */}
      {showAddComment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">إضافة تعليق</h3>
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <label className="block mb-1">التعليق</label>
                <textarea
                  className="input-field"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAddComment(false)}>
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

export default TaskDetail; 