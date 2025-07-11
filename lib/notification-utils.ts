// import { NotificationData, NotificationGroup } from "@/types/notification";

import { NotificationData, NotificationGroup } from "@/utils/types";

export const groupNotificationsByDate = (notifications: NotificationData[]): NotificationGroup[] => {
  const groups: { [key: string]: NotificationData[] } = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
  });
  
  return Object.entries(groups).map(([date, notifications]) => ({
    date,
    notifications
  }));
};

export const getNotificationIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    'TASK_CREATED': '📋',
    'TASK_ASSIGNED': '👤',
    'TASK_COMPLETED': '✅',
    'TASK_UPDATED': '📝',
    'PROJECT_CREATED': '🚀',
    'PROJECT_MEMBER_JOINED': '👥',
    'PROJECT_INVITATION_SENT': '📤',
    'PROJECT_INVITATION_ACCEPTED': '✉️',
    'PROJECT_COMMENT_ADDED': '💬',
    'WORKSPACE_MEMBER_JOINED': '🏢',
    'JOIN_REQUEST_SENT': '🔔',
    'JOIN_REQUEST_ACCEPTED': '✅',
    'JOIN_REQUEST_DECLINED': '❌',
    'FILE_UPLOADED': '📁',
    'ACHIEVEMENT_UNLOCKED': '🏆',
    'SYSTEM_UPDATE': '🔄',
    'REMINDER': '⏰'
  };
  
  return iconMap[type] || '🔔';
};

export const getNotificationColor = (type: string) => {
  const colorMap: { [key: string]: string } = {
    'TASK_CREATED': 'bg-blue-500',
    'TASK_ASSIGNED': 'bg-purple-500',
    'TASK_COMPLETED': 'bg-green-500',
    'TASK_UPDATED': 'bg-yellow-500',
    'PROJECT_CREATED': 'bg-emerald-500',
    'PROJECT_MEMBER_JOINED': 'bg-cyan-500',
    'PROJECT_INVITATION_SENT': 'bg-orange-500',
    'PROJECT_INVITATION_ACCEPTED': 'bg-green-500',
    'PROJECT_COMMENT_ADDED': 'bg-indigo-500',
    'WORKSPACE_MEMBER_JOINED': 'bg-pink-500',
    'JOIN_REQUEST_SENT': 'bg-amber-500',
    'JOIN_REQUEST_ACCEPTED': 'bg-green-500',
    'JOIN_REQUEST_DECLINED': 'bg-red-500',
    'FILE_UPLOADED': 'bg-teal-500',
    'ACHIEVEMENT_UNLOCKED': 'bg-yellow-500',
    'SYSTEM_UPDATE': 'bg-slate-500',
    'REMINDER': 'bg-rose-500'
  };
  
  return colorMap[type] || 'bg-gray-500';
};

export const formatNotificationTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};