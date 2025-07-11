export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  date_joined: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  manager: User;
  members: User[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project: Project;
  assignee: User;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  task: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user: User;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_task?: number;
  related_project?: number;
}

export interface TaskLog {
  id: number;
  task: number;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by: User;
  changed_at: string;
}

export interface TaskFollower {
  id: number;
  user: User;
  task: number;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
} 