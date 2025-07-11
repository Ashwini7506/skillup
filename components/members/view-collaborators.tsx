'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageCircle, Users, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export interface Collaborator {
  id: string;
  name: string;
  job: string;
  role: string;
  image?: string;
}


interface ViewCollaboratorsProps {
  collaborators: Collaborator[];
  onMessageAction: (userId: string) => void;
  onViewProfileAction: (userId: string) => void;
  loading?: boolean;
}

export default function ViewCollaborators({
  collaborators,
  onMessageAction,
  onViewProfileAction,
  loading = false,
}: ViewCollaboratorsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
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
    const workspaceId = useWorkspaceId();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>My Collaborators ({collaborators.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search collaborators..."
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
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No collaborators yet</p>
                  <p className="text-sm text-gray-400">
                    Connect with members to start collaborating
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No collaborators found</p>
                  <p className="text-sm text-gray-400">
                    Try adjusting your search terms
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCollaborators.map((collaborator) => (
                <Card key={collaborator.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={collaborator.image} alt={collaborator.name} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {getInitials(collaborator.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {collaborator.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {collaborator.job}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {collaborator.role}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onMessageAction(collaborator.id)}
                          disabled={loading}
                          className="flex items-center space-x-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Message</span>
                        </Button>

                        {/* Replace 'workspaceId' and 'userId' with actual values */}
                        <Link href={`/workspace/${workspaceId}/portfolio/${collaborator.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewProfileAction(collaborator.id)}
                            disabled={loading}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Profile</span>
                          </Button>
                        </Link>


                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}