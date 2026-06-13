import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Get auth state to check if user is authenticated
  const { isAuthenticated } = useAuth();

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const response = await api.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (err) {
      // Don't log 401 errors as they're expected when not authenticated
      if (err.response?.status !== 401) {
        console.error('Error fetching unread count:', err);
      } else {
        setUnreadCount(0);
      }
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return;
    
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/api/notifications?page=${pageNum}&limit=10`);
      const { notifications: newNotifications, pagination } = response.data;
      
      if (reset || pageNum === 1) {
        setNotifications(newNotifications || []);
      } else {
        setNotifications(prev => [...prev, ...(newNotifications || [])]);
      }
      
      setPage(pagination?.page || 1);
      setTotalPages(pagination?.pages || 1);
      setHasMore((pagination?.page || 1) < (pagination?.pages || 1));
      
      // Update unread count
      if (pageNum === 1) {
        setUnreadCount(newNotifications?.filter(n => !n.isRead).length || 0);
        await fetchUnreadCount();
      }
    } catch (err) {
      // Don't log 401 errors as they're expected when not authenticated
      if (err.response?.status !== 401) {
        console.error('Error fetching notifications:', err);
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, fetchUnreadCount, isAuthenticated]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/api/notifications/read-all');
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Delete a single notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      
      const deleted = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await api.delete('/api/notifications');
      
      setNotifications([]);
      setUnreadCount(0);
      toast.success(`Deleted ${response.data.deletedCount || 0} notifications`);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      toast.error('Failed to delete notifications');
    }
  }, []);

  // Create a notification (for internal use)
  const createNotification = useCallback(async (data) => {
    try {
      const response = await api.post('/api/notifications', data);
      toast.success('Notification created');
      return response.data.notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      toast.error('Failed to create notification');
      return null;
    }
  }, []);

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications(1, true);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Initialize on mount and when authenticated
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    page,
    hasMore,
    totalPages,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
    loadMore,
    refresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

