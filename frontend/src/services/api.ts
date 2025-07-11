import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Project, 
  Task, 
  Comment, 
  Notification, 
  TaskLog, 
  TaskFollower,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  PaginatedResponse 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post('/api/token/refresh/', {
                refresh: refreshToken,
              });
              const { access } = response.data;
              localStorage.setItem('access_token', access);
              this.api.defaults.headers.Authorization = `Bearer ${access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response: AxiosResponse<AuthTokens> = await this.api.post('/token/', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users/', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/users/me/');
    return response.data;
  }

  // Project endpoints
  async getProjects(params?: any): Promise<PaginatedResponse<Project>> {
    const response: AxiosResponse<PaginatedResponse<Project>> = await this.api.get('/projects/', { params });
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response: AxiosResponse<Project> = await this.api.get(`/projects/${id}/`);
    return response.data;
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<Project> = await this.api.post('/projects/', data);
    return response.data;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<Project> = await this.api.put(`/projects/${id}/`, data);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/projects/${id}/`);
  }

  async addProjectMember(projectId: number, userId: number): Promise<void> {
    await this.api.post(`/projects/${projectId}/add_member/`, { user_id: userId });
  }

  async removeProjectMember(projectId: number, userId: number): Promise<void> {
    await this.api.post(`/projects/${projectId}/remove_member/`, { user_id: userId });
  }

  async getMyProjects(): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await this.api.get('/projects/my_projects/');
    return response.data;
  }

  async getMemberProjects(): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await this.api.get('/projects/member_projects/');
    return response.data;
  }

  // Task endpoints
  async getTasks(params?: any): Promise<PaginatedResponse<Task>> {
    const response: AxiosResponse<PaginatedResponse<Task>> = await this.api.get('/tasks/', { params });
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response: AxiosResponse<Task> = await this.api.get(`/tasks/${id}/`);
    return response.data;
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    const response: AxiosResponse<Task> = await this.api.post('/tasks/', data);
    return response.data;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response: AxiosResponse<Task> = await this.api.put(`/tasks/${id}/`, data);
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await this.api.delete(`/tasks/${id}/`);
  }

  async getMyTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.api.get('/tasks/my_tasks/');
    return response.data;
  }

  async getCreatedTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.api.get('/tasks/created_tasks/');
    return response.data;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.api.get('/tasks/overdue_tasks/');
    return response.data;
  }

  async getPinnedTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.api.get('/tasks/pinned_tasks/');
    return response.data;
  }

  async pinTask(id: number): Promise<void> {
    await this.api.post(`/tasks/${id}/pin_task/`);
  }

  async unpinTask(id: number): Promise<void> {
    await this.api.post(`/tasks/${id}/unpin_task/`);
  }

  // Comment endpoints
  async getComments(params?: any): Promise<PaginatedResponse<Comment>> {
    const response: AxiosResponse<PaginatedResponse<Comment>> = await this.api.get('/comments/', { params });
    return response.data;
  }

  async createComment(data: Partial<Comment>): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post('/comments/', data);
    return response.data;
  }

  async updateComment(id: number, data: Partial<Comment>): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.put(`/comments/${id}/`, data);
    return response.data;
  }

  async deleteComment(id: number): Promise<void> {
    await this.api.delete(`/comments/${id}/`);
  }

  // Notification endpoints
  async getNotifications(params?: any): Promise<PaginatedResponse<Notification>> {
    const response: AxiosResponse<PaginatedResponse<Notification>> = await this.api.get('/notifications/', { params });
    return response.data;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await this.api.post(`/notifications/${id}/mark_as_read/`);
  }

  async markNotificationAsUnread(id: number): Promise<void> {
    await this.api.post(`/notifications/${id}/mark_as_unread/`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.post('/notifications/mark_all_as_read/');
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response: AxiosResponse<{ count: number }> = await this.api.get('/notifications/unread_count/');
    return response.data;
  }

  // Task Log endpoints
  async getTaskLogs(params?: any): Promise<PaginatedResponse<TaskLog>> {
    const response: AxiosResponse<PaginatedResponse<TaskLog>> = await this.api.get('/notifications/logs/', { params });
    return response.data;
  }

  // Task Follower endpoints
  async getTaskFollowers(params?: any): Promise<PaginatedResponse<TaskFollower>> {
    const response: AxiosResponse<PaginatedResponse<TaskFollower>> = await this.api.get('/tasks/followers/', { params });
    return response.data;
  }

  async followTask(taskId: number): Promise<TaskFollower> {
    const response: AxiosResponse<TaskFollower> = await this.api.post('/tasks/followers/', { task: taskId });
    return response.data;
  }

  async unfollowTask(followerId: number): Promise<void> {
    await this.api.delete(`/tasks/followers/${followerId}/`);
  }

  async getMyFollowedTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.api.get('/tasks/followers/my_followed_tasks/');
    return response.data;
  }
}

export default new ApiService(); 