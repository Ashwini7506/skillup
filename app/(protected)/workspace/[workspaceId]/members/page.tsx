'use client';

import React, {use, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Users, Search, MessageCircle, Inbox, UserPlus } from 'lucide-react';
import MembersSearch from '@/components/members/members-search';
import MemberCard from '@/components/members/member-card';
import ViewCollaborators from '@/components/members/view-collaborators';
import Chat from '@/components/members/chat';
import RequestsPane from '@/components/members/requests-pane';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface Member {
  id: string;
  name: string;
  job: string;
  role: string;
  image?: string;
}

interface JoinRequest {
  id: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requester?: Member;
  user?: Member;
  project?: { id: string; name: string } | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface MembersPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

interface MembersSearchProps {
  onSearchAction: (filters: { job: string; role: string }) => Promise<void>;
  onClearFiltersAction: () => void;
  loading: boolean;
}

interface MemberCardProps {
  member: Member;
  isConnected?: boolean;
  onSendRequest?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  loading?: boolean;
}

interface ViewCollaboratorsProps {
  collaborators: Member[];
  onMessageAction: (userId: string) => void;
  onViewProfileAction: (userId: string) => void;
  loading?: boolean;
}

interface ChatProps {
  currentUserId: string;
  collaborators: Member[];
  onSendMessageAction: (receiverId: string, content: string) => Promise<void>;
  onLoadMessagesAction: (userId: string) => Promise<Message[]>;
  loading?: boolean;
}

interface MessagesPaneProps {
  currentUserId: string;
  selectedUser: Member | null;
  messages: Message[];
  onSendMessageAction: (content: string) => void;
  onBackAction: () => void;
  loading?: boolean;
}

interface RequestsPaneProps {
  incoming: JoinRequest[];
  outgoing: JoinRequest[];
  onAcceptRequestAction: (requestId: string) => Promise<void>;
  onRejectRequestAction: (requestId: string) => Promise<void>;
  loading: boolean;
}

export default function MembersPage({ params }: MembersPageProps) {
  const { workspaceId } =  use(params);
  const { user } = useKindeBrowserClient();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState('discover');
  const [members, setMembers] = useState<Member[]>([]);
  const [collaborators, setCollaborators] = useState<Member[]>([]);
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [requests, setRequests] = useState<{ incoming: JoinRequest[]; outgoing: JoinRequest[] }>({
    incoming: [],
    outgoing: []
  });
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ job: '', role: '' });

  // Fetch suggestions, collaborators, and requests on component mount
  useEffect(() => {
    fetchSuggestions();
    fetchCollaborators();
    fetchRequests();
  }, [workspaceId]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/members/suggestions?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/members/accepted?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/members/requests?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSearchAction = async (filters: { job: string; role: string }) => {
    setLoading(true);
    setSearchFilters(filters);
    
    try {
      const queryParams = new URLSearchParams({
        workspaceId,
        ...(filters.job && { job: filters.job }),
        ...(filters.role && { role: filters.role })
      });
      
      const response = await fetch(`/api/members/search?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error searching members:', error);
      toast.error('Failed to search members');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFiltersAction = () => {
    setMembers([]);
    setSearchFilters({ job: '', role: '' });
  };

  const handleSendRequest = (userId: string) => {
    (async () => {
      try {
        const response = await fetch('/api/members/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId: userId, workspaceId })
        });

        if (response.ok) {
          toast.success('Connection request sent successfully');
          // Remove from suggestions and search results
          setSuggestions(prev => prev.filter(member => member.id !== userId));
          setMembers(prev => prev.filter(member => member.id !== userId));
          fetchRequests(); // Refresh requests
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to send request');
        }
      } catch (error) {
        console.error('Error sending request:', error);
        toast.error('Failed to send request');
      }
    })();
  };

  const handleAcceptRequestAction = async (requestId: string) => {
    try {
      const response = await fetch('/api/members/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'accept', workspaceId })
      });

      if (response.ok) {
        toast.success('Request accepted successfully');
        fetchRequests();
        fetchCollaborators();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequestAction = async (requestId: string) => {
    try {
      const response = await fetch('/api/members/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject', workspaceId })
      });

      if (response.ok) {
        toast.success('Request rejected');
        fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleSendMessageAction = async (receiverId: string, content: string) => {
    try {
      const response = await fetch('/api/members/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content, workspaceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  const handleLoadMessagesAction = async (userId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`/api/members/chat?userId=${userId}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  const handleMessageUserAction = (userId: string) => {
    setActiveTab('messages');
    // The Chat component will handle the rest
  };

  const handleViewProfileAction = (userId: string) => {
    // Navigate to profile page or open profile modal
    console.log('View profile for user:', userId);
    // You can implement navigation here
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Members</h1>
        <p className="text-gray-600">
          Discover, connect, and collaborate with team members
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Discover</span>
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Collaborators</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Inbox className="w-4 h-4" />
            <span>Requests</span>
            {(requests.incoming.length + requests.outgoing.length) > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {requests.incoming.length + requests.outgoing.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MembersSearch
                onSearchAction={handleSearchAction}
                onClearFiltersAction={handleClearFiltersAction}
                loading={loading}
              />
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {members.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Search Results ({members.length})
                      </h3>
                      <div className="grid gap-4">
                        {members.map((member) => (
                          <MemberCard
                            key={member.id}
                            member={member}
                            onSendRequest={handleSendRequest}
                            onMessage={handleMessageUserAction}
                            onViewProfile={handleViewProfileAction}
                            loading={loading}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Suggested Members ({suggestions.length})
                      </h3>
                      {suggestions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No suggestions available</p>
                          <p className="text-sm text-gray-400">
                            Use the search filters to find members
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {suggestions.map((member) => (
                            <MemberCard
                              key={member.id}
                              member={member}
                              onSendRequest={handleSendRequest}
                              onMessage={handleMessageUserAction}
                              onViewProfile={handleViewProfileAction}
                              loading={loading}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collaborators">
          <ViewCollaborators
            collaborators={collaborators}
            onMessageAction={handleMessageUserAction}
            onViewProfileAction={handleViewProfileAction}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="messages">
          <div className="h-[600px]">
            {userId ? (
              <Chat
                currentUserId={userId}
                collaborators={collaborators}
                onSendMessageAction={handleSendMessageAction}
                onLoadMessagesAction={handleLoadMessagesAction}
                loading={loading}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading user information...</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <RequestsPane
            incoming={requests.incoming}
            outgoing={requests.outgoing}
            onAcceptRequestAction={handleAcceptRequestAction}
            onRejectRequestAction={handleRejectRequestAction}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
