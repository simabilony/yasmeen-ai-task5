import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProjects(search ? { search } : {});
      setProjects(response.results);
    } catch (err) {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, [search]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newProject.title.trim()) {
      setError('العنوان مطلوب');
      return;
    }
    try {
      const project = await api.createProject(newProject);
      setProjects([project, ...projects]);
      setShowAdd(false);
      setNewProject({ title: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ أثناء إضافة المشروع');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">المشاريع</h2>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <PlusIcon className="h-5 w-5" /> مشروع جديد
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="input-field pr-10"
            placeholder="بحث عن مشروع..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 py-12">لا توجد مشاريع</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="card flex flex-col justify-between h-full">
              <div>
                <h3 className="text-lg font-semibold text-primary-700 mb-1">{project.title}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                <div className="text-xs text-gray-400 mb-2">مدير المشروع: {project.manager.first_name} {project.manager.last_name}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.members.map(member => (
                    <span key={member.id} className="badge badge-info">{member.first_name} {member.last_name}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Link to={`/projects/${project.id}`} className="btn-secondary">تفاصيل</Link>
                {user?.id === project.manager.id && (
                  <button
                    className="btn-danger text-xs"
                    onClick={async () => {
                      if (window.confirm('هل أنت متأكد من حذف المشروع؟')) {
                        await api.deleteProject(project.id);
                        setProjects(projects.filter(p => p.id !== project.id));
                      }
                    }}
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* إضافة مشروع جديد */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAdd(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">إضافة مشروع جديد</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block mb-1">العنوان</label>
                <input
                  type="text"
                  className="input-field"
                  value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">الوصف</label>
                <textarea
                  className="input-field"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>إلغاء</button>
                <button type="submit" className="btn-primary">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 