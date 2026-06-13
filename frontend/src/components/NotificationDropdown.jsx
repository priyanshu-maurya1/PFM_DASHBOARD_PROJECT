import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = ({ getNotificationIcon, getPriorityBadge }) => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications,
    loadMore,
    hasMore,
    fetchNotifications,
    isOpen,
    setIsOpen
  } = useNotifications();
  
  const { isAuthenticated } = useAuth();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications(1, true);
    }
  }, [isOpen, isAuthenticated, fetchNotifications]);

  // Format relative time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    // Close dropdown
    setIsOpen(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  // Handle delete all
  const handleDeleteAll = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      deleteAllNotifications();
    }
  };

  // Handle delete single
  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  // Don't render if closed
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 max-h-[32rem] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs hover:text-blue-100 transition-colors"
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="text-xs hover:text-red-100 transition-colors"
              title="Delete all"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          // Loading state
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h4 className="text-gray-600 font-medium mb-1">No notifications</h4>
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          // Notifications list
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getPriorityBadge(notification.priority)}
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, notification._id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 transition-colors"
                    title="Delete notification"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Unread indicator line */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Load More */}
      {notifications.length > 0 && hasMore && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more notifications'}
          </button>
        </div>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to full notifications page
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

