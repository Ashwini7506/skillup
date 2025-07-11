"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Settings, Trash2, Filter } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";
import { groupNotificationsByDate } from "@/lib/notification-utils";
import { NotificationData, NotificationStats } from "@/utils/types";
import { NotificationItem } from "../notifications/notification-item";

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string, read: boolean) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, markAsRead: read }),
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read } : notif
        )
      );
      
      setStats(prev => ({
        ...prev,
        unread: read ? prev.unread - 1 : prev.unread + 1
      }));
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' }),
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleActionClick = (notification: NotificationData, action: string) => {
    console.log(`Action ${action} clicked for notification ${notification.id}`);
    // Handle specific actions like accept/decline join requests
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || (filter === 'unread' && !notif.read)
  );

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 hover:bg-accent"
        >
          <Bell className="h-5 w-5" />
          {stats.unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium animate-pulse">
              {stats.unread > 99 ? '99+' : stats.unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-lg">Notifications</h3>
              {stats.unread > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  {stats.unread} new
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              >
                <Filter className={`h-4 w-4 ${filter === 'unread' ? 'text-blue-500' : 'text-gray-400'}`} />
              </Button>
              
              {stats.unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 text-green-500" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'unread' ? 'You\'re all caught up!' : 'We\'ll notify you when something happens'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {groupedNotifications.map((group) => (
                <div key={group.date} className="mb-4">
                  <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 py-1 mb-2">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group.date}
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    {group.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkReadAction={markAsRead}
                        onActionClick={handleActionClick}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {filteredNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};