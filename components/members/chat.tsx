'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, ArrowLeft } from 'lucide-react';
import MessagesPane from './messages-pane';

interface User {
  id: string;
  name: string;
  job: string;
  role: string;
  image?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface ChatProps {
  currentUserId: string;
  collaborators: User[];
  onSendMessageAction: (receiverId: string, content: string) => void;
  onLoadMessagesAction: (userId: string) => Promise<Message[]>;
  loading?: boolean;
}

export default function Chat({
  currentUserId,
  collaborators,
  onSendMessageAction,
  onLoadMessagesAction,
  loading = false,
}: ChatProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredCollaborators = collaborators.filter(collaborator =>
    collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.job.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setLoadingMessages(true);
    
    try {
      const userMessages = await onLoadMessagesAction(user.id);
      setMessages(userMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUser) return;
    
    await onSendMessageAction(selectedUser.id, content);
    
    // Reload messages after sending
    try {
      const userMessages = await onLoadMessagesAction(selectedUser.id);
      setMessages(userMessages);
    } catch (error) {
      console.error('Error reloading messages:', error);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  return (
    <div className="flex h-full">
      {/* Collaborators List */}
      <div className={`${selectedUser ? 'hidden lg:block' : 'block'} w-full lg:w-80 border-r`}>
        <Card className="h-full border-0 rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Collaborators List */}
            <ScrollArea className="h-96">
              {filteredCollaborators.length === 0 ? (
                <div className="text-center py-8">
                  {collaborators.length === 0 ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No conversations yet</p>
                      <p className="text-sm text-gray-400">
                        Connect with members to start messaging
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No conversations found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search terms
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCollaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      onClick={() => handleSelectUser(collaborator)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedUser?.id === collaborator.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={collaborator.image} alt={collaborator.name} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {getInitials(collaborator.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {collaborator.name}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {collaborator.job}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Messages Pane */}
      <div className={`${selectedUser ? 'block' : 'hidden lg:block'} flex-1`}>
        <MessagesPane
          currentUserId={currentUserId}
          selectedUser={selectedUser}
          messages={messages}
          onSendMessageAction={handleSendMessage}
          onBackAction={handleBack}
          loading={loadingMessages}
        />
      </div>
    </div>
  );
}