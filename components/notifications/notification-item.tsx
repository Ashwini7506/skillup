"use client";

import { getNotificationIcon, getNotificationColor, formatNotificationTime } from "@/lib/notification-utils";
import { NotificationData } from "@/utils/types";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";

interface NotificationItemProps {
  notification: NotificationData;
  onMarkReadAction: (id: string, read: boolean) => void;
  onActionClick?: (notification: NotificationData, action: string) => void;
}

export const NotificationItem = ({ 
  notification, 
  onMarkReadAction, 
  onActionClick 
}: NotificationItemProps) => {
  const icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.createdAt);

  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(notification, action);
    }
  };

  const renderActionButtons = () => {
    if (notification.type === 'JOIN_REQUEST_SENT') {
      return (
        <div className="flex space-x-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            onClick={() => handleActionClick('accept')}
          >
            <Check className="h-3 w-3 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
            onClick={() => handleActionClick('decline')}
          >
            <X className="h-3 w-3 mr-1" />
            Decline
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      !notification.read 
        ? 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/10 dark:border-blue-800/30' 
        : 'bg-white border-gray-200 dark:bg-gray-900/50 dark:border-gray-700'
    }`}>
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      )}
      
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white shadow-lg`}>
          <span className="text-lg">{icon}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              !notification.read 
                ? 'font-medium text-gray-900 dark:text-gray-100' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {notification.description}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
              {timeAgo}
            </span>
          </div>
          
          {/* Project or additional info */}
          {notification.project && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              in {notification.project.name}
            </p>
          )}
          
          {/* Action buttons */}
          {renderActionButtons()}
        </div>
      </div>
      
     
    </div>
  );
};