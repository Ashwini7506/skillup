'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Clock, Send, Inbox } from 'lucide-react';

interface JoinRequest {
  id: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requester?: {
    id: string;
    name: string;
    job: string;
    role: string;
    image?: string;
  };
  user?: {
    id: string;
    name: string;
    job: string;
    role: string;
    image?: string;
  };
  project?: {
    id: string;
    name: string;
  } | null;
}

interface RequestsPaneProps {
  incoming: JoinRequest[];
  outgoing: JoinRequest[];
  onAcceptRequestAction: (requestId: string) => void;
  onRejectRequestAction: (requestId: string) => void;
  loading?: boolean;
}

export default function RequestsPane({
  incoming,
  outgoing,
  onAcceptRequestAction,
  onRejectRequestAction,
  loading = false,
}: RequestsPaneProps) {
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    try {
      await onAcceptRequestAction(requestId);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    try {
      await onRejectRequestAction(requestId);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const RequestCard = ({ request, type }: { request: JoinRequest; type: 'incoming' | 'outgoing' }) => {
    const user = type === 'incoming' ? request.requester : request.user;
    const isProcessing = processingRequests.has(request.id);

    if (!user) return null;

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 truncate">
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {user.job}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {user.role}
                  </Badge>
                  
                  {request.project && (
                    <p className="text-xs text-gray-500 mt-1">
                      For project: {request.project.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(request.createdAt)}
                  </span>

                  {type === 'incoming' ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={isProcessing || loading}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={isProcessing || loading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Inbox className="w-5 h-5" />
          <span>Connection Requests</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="incoming" className="h-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="incoming" className="flex items-center space-x-2">
              <Inbox className="w-4 h-4" />
              <span>Incoming ({incoming.length})</span>
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Sent ({outgoing.length})</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96">
            <TabsContent value="incoming" className="mt-0 px-4">
              {incoming.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No incoming requests</p>
                  <p className="text-sm text-gray-400">
                    New connection requests will appear here
                  </p>
                </div>
              ) : (
                incoming.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="incoming"
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="mt-0 px-4">
              {outgoing.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No sent requests</p>
                  <p className="text-sm text-gray-400">
                    Requests you send will appear here
                  </p>
                </div>
              ) : (
                outgoing.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="outgoing"
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}