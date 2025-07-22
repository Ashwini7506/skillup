// components/sprint/tabs/TeamTab.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Input } from '../../ui/input';
import {
  Users,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  Clock,
  Target,
  ChevronDown,
  Send,
  X,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SprintLandingData, TeamMemberStats } from '@/utils/sprintHub/types';

interface TeamTabProps {
  data: SprintLandingData;
  workspaceId: string;
  readonly?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  senderRole?: string;
  content: string;
  timestamp: Date;
}

export function TeamTab({ data, workspaceId, readonly = false }: TeamTabProps) {
  const router = useRouter();
  const [memberStats, setMemberStats] = useState<TeamMemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.project?.id) {
      fetchMemberStats();
    }
  }, [data.project?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch messages on component mount
  useEffect(() => {
    fetchGroupChatMessages();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMemberStats = async () => {
    try {
      const response = await fetch(`/api/projects/${data.project?.id}/member-stats`);
      if (response.ok) {
        const stats = await response.json();
        setMemberStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch member stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupChatMessages = async () => {
    setLoadingMessages(true);
    try {
      const teamMemberIds = data.teamMembers.map(m => m.id);
      const response = await fetch('/api/get-group-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamMembers: teamMemberIds,
          workspaceId: workspaceId,
          projectId: data.project?.id,
        }),
      });

      if (response.ok) {
        const messages = await response.json();
        setChatMessages(messages);
      } else {
        console.error('Failed to fetch group messages');
        showSampleMessages();
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
      showSampleMessages();
    } finally {
      setLoadingMessages(false);
    }
  };

  const showSampleMessages = () => {
    setChatMessages([
      {
        id: '1',
        senderId: data.teamMembers[0]?.id || '1',
        senderEmail: data.teamMembers[0]?.email || 'teammate1@example.com',
        senderRole: data.teamMembers[0]?.sprintRole || 'Developer',
        content: 'Hey team! How is everyone doing with their tasks?',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        senderId: data.teamMembers[1]?.id || '2',
        senderEmail: data.teamMembers[1]?.email || 'teammate2@example.com',
        senderRole: data.teamMembers[1]?.sprintRole || 'Designer',
        content: 'Almost done with the UI mockups. Will share them by end of day!',
        timestamp: new Date(Date.now() - 1800000),
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'current-user',
      senderEmail: 'You',
      senderRole: 'Your Role',
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch('/api/send-group-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageToSend,
          workspaceId: workspaceId,
          projectId: data.project?.id,
          teamMembers: data.teamMembers.map(m => m.id),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Message sent successfully:', result);

        setChatMessages(prev => prev.map(msg =>
          msg.id === optimisticMessage.id
            ? { ...msg, id: `sent-${Date.now()}` }
            : msg
        ));
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessage(messageId);
    setShowMessageOptions(null);

    try {
      const response = await fetch('/api/delete-group-message', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: messageId,
          workspaceId: workspaceId,
          projectId: data.project?.id,
        }),
      });

      if (response.ok) {
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole.includes('lead') || normalizedRole.includes('manager')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (normalizedRole.includes('developer') || normalizedRole.includes('engineer')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (normalizedRole.includes('designer') || normalizedRole.includes('ui')) {
      return 'bg-green-100 text-green-800';
    }
    if (normalizedRole.includes('qa') || normalizedRole.includes('test')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getInitials = (email?: string) => {
    if (!email || typeof email !== 'string') return 'NA';
    const namePart = email.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const teamStats = data.teamMembers.reduce((acc, member) => {
    acc.totalTasks += member.taskCount;
    acc.completedTasks += member.completedTasks;
    return acc;
  }, { totalTasks: 0, completedTasks: 0 });

  const teamCompletionRate = teamStats.totalTasks > 0
    ? (teamStats.completedTasks / teamStats.totalTasks) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {data.team?.name || 'Your Team'}
            </span>
            <Badge variant="outline">
              {data.teamMembers.length} Members
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teamStats.totalTasks}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {teamStats.completedTasks}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getCompletionColor(teamCompletionRate)}`}>
                {Math.round(teamCompletionRate)}%
              </div>
              <div className="text-sm text-gray-600">Team Progress</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Team Completion Rate</span>
              <span>{Math.round(teamCompletionRate)}%</span>
            </div>
            <Progress value={teamCompletionRate} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.teamMembers.map((member) => {
              const completionRate = member.taskCount > 0
                ? (member.completedTasks / member.taskCount) * 100
                : 0;

              return (
                <div key={member.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(member.email || 'null')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{member.email}</span>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(member.sprintRole)}
                      >
                        {member.sprintRole}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {member.taskCount} tasks
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {member.completedTasks} completed
                        </span>
                        <span className={`flex items-center ${getCompletionColor(completionRate)}`}>
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.round(completionRate)}%
                        </span>
                      </div>

                      <div className="mt-2">
                        <Progress value={completionRate} className="w-full h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced 2:1 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simple Quick Actions */}
          {!readonly && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  onClick={() => router.push(`/workspace/${workspaceId}/projects/${data.project?.id}`)}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open Project Board
                </Button>
                
                {/* Commented out View Reports button */}
                {/* <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`/workspace/${workspaceId}/reports`, '_blank')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  View Reports
                </Button> */}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Project:</span>
                    <span className="text-blue-600 font-semibold">{data.project?.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Team Size:</span>
                    <span className="text-gray-900">{data.teamMembers.length} members</span>
                  </div>
                </div>
                
                {/* Task Statistics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Tasks:</span>
                    <Badge variant="outline" className="text-blue-600">
                      {data.project?.tasks.length || 0}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Completed:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {data.project?.tasks.filter(t => t.completed).length || 0}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Pending:</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {data.project?.tasks.filter(t => !t.completed).length || 0}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Project Progress</span>
                  <span className="font-medium">
                    {Math.round(((data.project?.tasks.filter(t => t.completed).length || 0) / (data.project?.tasks.length || 1)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((data.project?.tasks.filter(t => t.completed).length || 0) / (data.project?.tasks.length || 1)) * 100} 
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width - Chat Panel */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  {data.teamMembers.slice(0, 2).map((member, index) => (
                    <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getInitials(member.email || 'null')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {data.teamMembers.length > 2 && (
                    <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      +{data.teamMembers.length - 2}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">Team Chat</div>
                  <div className="text-xs text-gray-500">{data.teamMembers.length} members</div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      Loading messages...
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                      <div className="font-medium mb-1">Start chatting!</div>
                      <div className="text-xs">Say hello to your team.</div>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className="group relative">
                        <div className="flex space-x-2">
                          <Avatar className="h-6 w-6 flex-shrink-0 mt-1">
                            <AvatarFallback className={`text-xs ${message.senderEmail === 'You'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                              {message.senderEmail === 'You'
                                ? 'You'.substring(0, 2).toUpperCase()
                                : getInitials(message.senderEmail)
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-medium text-gray-900 truncate">
                                {message.senderEmail === 'You' ? 'You' : message.senderEmail}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-800">
                              {message.content}
                            </div>
                          </div>
                          
                          {(message.senderEmail === 'You' || !readonly) && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setShowMessageOptions(showMessageOptions === message.id ? null : message.id)}
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                              
                              {showMessageOptions === message.id && (
                                <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg z-10 min-w-[100px]">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    disabled={deletingMessage === message.id}
                                  >
                                    {deletingMessage === message.id ? (
                                      <div className="animate-spin w-3 h-3 border border-red-600 border-t-transparent rounded-full mr-2" />
                                    ) : (
                                      <Trash2 className="w-3 h-3 mr-2" />
                                    )}
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={sendingMessage || readonly}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage || readonly}
                      size="sm"
                    >
                      {sendingMessage ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showMessageOptions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMessageOptions(null)}
        />
      )}
    </div>
  );
}
