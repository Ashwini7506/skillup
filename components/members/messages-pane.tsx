'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  image?: string;
  job: string;
  role: string;
}

interface MessagesPaneProps {
  currentUserId: string;
  selectedUser: User | null;
  messages: Message[];
  onSendMessageAction: (content: string) => Promise<void>;
  onBackAction: () => void;
  loading: boolean;
}

// interface MessagesPaneProps {
//   currentUserId: string;
//   selectedUser: User | null;
//   messages: Message[];
//   onSendMessageAction: (content: string) => void;
//   onBackAction: () => void;
//   loading?: boolean;
// }

export default function MessagesPane({
  currentUserId,
  selectedUser,
  messages,
  onSendMessageAction,
  onBackAction,
  loading = false,
}: MessagesPaneProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessageAction(newMessage.trim());
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!selectedUser) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold">Select a conversation</p>
          <p className="text-sm">Choose a member to start messaging</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackAction}
            className="lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(selectedUser.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {selectedUser.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {selectedUser.job} • {selectedUser.role}
            </p>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUserId;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-4">
                        {formatDate(message.createdAt)}
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex items-end space-x-2",
                      isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                    )}>
                      {!isCurrentUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {getInitials(selectedUser.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        isCurrentUser 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-100 text-gray-900"
                      )}>
                        <p className="text-sm">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          isCurrentUser ? "text-blue-100" : "text-gray-600"
                        )}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${selectedUser?.name}...`}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}