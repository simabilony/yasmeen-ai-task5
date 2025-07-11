import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification } from '../types';
import { 
  BellIcon, 
  CheckIcon, 
  EyeIcon, 
  EyeSlashIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAsUnread, markAllAsRead, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'read':
        return notification.is_read;
      case 'unread':
        return !notification.is_read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.related_task) {
      return '📋';
    } else if (notification.related_project) {
      return '📁';
    }
    return '🔔';
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.related_task) {
      return `/tasks/${notification.related_task}`;
    } else if (notification.related_project) {
      return `/projects/${notification.related_project}`;
    }
    return '#';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BellIcon className="h-6 w-6" />
          الإشعارات
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        
        <div className="flex items-center gap-2">
          <select
            className="input-field"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
            <option value="all">جميع الإشعارات</option>
            <option value="unread">غير المقروءة</option>
            <option value="read">المقروءة</option>
          </select>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckIcon className="h-4 w-4" />
              تحديد جميعها كمقروءة
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          {filter === 'all' ? 'لا توجد إشعارات' : 
           filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 
           'لا توجد إشعارات مقروءة'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                notification.is_read 
                  ? 'border-gray-200 opacity-75' 
                  : 'border-primary-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                          جديد
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new Date(notification.created_at).toLocaleString('ar-SA')}
                      </span>
                      
                      {(notification.related_task || notification.related_project) && (
                        <Link
                          to={getNotificationLink(notification)}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          عرض التفاصيل
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {notification.is_read ? (
                    <button
                      onClick={() => markAsUnread(notification.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="تحديد كغير مقروء"
                    >
                      <EyeSlashIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-primary-600 hover:text-primary-800 rounded-lg hover:bg-primary-50"
                      title="تحديد كمقروء"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">إحصائيات الإشعارات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
            <div className="text-sm text-gray-600">إجمالي الإشعارات</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-blue-600">غير المقروءة</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.is_read).length}
            </div>
            <div className="text-sm text-green-600">المقروءة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 