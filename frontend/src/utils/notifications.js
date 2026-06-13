import api from './api';

/**
 * Notification API utility functions
 */
export const notificationApi = {
  // Get all notifications (paginated)
  getNotifications: (page = 1, limit = 20, type = null, isRead = null) => {
    let url = `/api/notifications?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (isRead !== null) url += `&isRead=${isRead}`;
    return api.get(url);
  },

  // Get unread notification count
  getUnreadCount: () => api.get('/api/notifications/unread-count'),

  // Get single notification
  getNotification: (id) => api.get(`/api/notifications/${id}`),

  // Mark notification as read
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => api.put('/api/notifications/read-all'),

  // Delete single notification
  delete: (id) => api.delete(`/api/notifications/${id}`),

  // Delete all notifications
  deleteAll: () => api.delete('/api/notifications'),

  // Create a notification
  create: (data) => api.post('/api/notifications', data),
};

/**
 * Helper functions for common notification scenarios
 */
export const notificationHelpers = {
  // Create enrollment notification
  enrollment: {
    success: (courseName, data = {}) => 
      notificationApi.create({
        type: 'enrollment',
        title: 'Enrollment Successful',
        message: `You have successfully enrolled in "${courseName}"`,
        priority: 'medium',
        metadata: { courseName, ...data },
      }),
    
    reminder: (courseName, data = {}) => 
      notificationApi.create({
        type: 'enrollment',
        title: 'Course Reminder',
        message: `Don't forget to continue "${courseName}"`,
        priority: 'low',
        metadata: { courseName, ...data },
      }),
  },

  // Create transaction notification
  transaction: {
    added: (amount, description, data = {}) => 
      notificationApi.create({
        type: 'transaction',
        title: 'Transaction Recorded',
        message: `New transaction of $${amount} for "${description}" has been recorded`,
        priority: 'medium',
        metadata: { amount, description, ...data },
      }),
    
    alert: (amount, threshold, data = {}) => 
      notificationApi.create({
        type: 'transaction',
        title: 'Transaction Alert',
        message: `You have spent $${amount}, exceeding your ${threshold} threshold`,
        priority: 'high',
        metadata: { amount, threshold, ...data },
      }),
  },

  // Create budget notification
  budget: {
    warning: (category, percentage, data = {}) => 
      notificationApi.create({
        type: 'budget',
        title: 'Budget Warning',
        message: `Your "${category}" budget has reached ${percentage}%`,
        priority: percentage > 90 ? 'urgent' : 'high',
        metadata: { category, percentage, ...data },
      }),
    
    exceeded: (category, spent, limit, data = {}) => 
      notificationApi.create({
        type: 'budget',
        title: 'Budget Exceeded',
        message: `You have exceeded your "${category}" budget by $${spent - limit}`,
        priority: 'urgent',
        metadata: { category, spent, limit, ...data },
      }),
  },

  // Create system notification
  system: {
    info: (title, message, priority = 'low') => 
      notificationApi.create({
        type: 'system',
        title,
        message,
        priority,
      }),
    
    maintenance: (scheduledTime, data = {}) => 
      notificationApi.create({
        type: 'system',
        title: 'Scheduled Maintenance',
        message: `System maintenance scheduled for ${scheduledTime}`,
        priority: 'medium',
        metadata: { scheduledTime, ...data },
      }),
  },

  // Create message notification
  message: {
    received: (senderName, preview, data = {}) => 
      notificationApi.create({
        type: 'message',
        title: `New message from ${senderName}`,
        message: preview,
        priority: 'medium',
        metadata: { senderName, ...data },
      }),
  },

  // Create LMS notification
  lms: {
    courseStarted: (courseName, data = {}) => 
      notificationApi.create({
        type: 'lms',
        title: 'Course Started',
        message: `You have started learning "${courseName}"`,
        priority: 'medium',
        metadata: { courseName, ...data },
      }),
    
    lessonCompleted: (courseName, lessonName, data = {}) => 
      notificationApi.create({
        type: 'lms',
        title: 'Lesson Completed! 🎉',
        message: `Great job! You completed "${lessonName}" in ${courseName}`,
        priority: 'low',
        metadata: { courseName, lessonName, ...data },
      }),
    
    courseCompleted: (courseName, data = {}) => 
      notificationApi.create({
        type: 'lms',
        title: 'Course Completed! 🏆',
        message: `Congratulations! You have completed "${courseName}"`,
        priority: 'high',
        metadata: { courseName, ...data },
      }),
    
    certificateReady: (courseName, data = {}) => 
      notificationApi.create({
        type: 'lms',
        title: 'Certificate Available',
        message: `Your certificate for "${courseName}" is ready to download`,
        priority: 'high',
        metadata: { courseName, ...data },
      }),
  },
};

export default notificationApi;

