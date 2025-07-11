import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MessageCircle, UserPlus, Eye } from 'lucide-react';

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    job: string;
    role: string;
    image?: string;
  };
  isConnected?: boolean;
  onSendRequest?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  loading?: boolean;
}

export default function MemberCard({
  member,
  isConnected = false,
  onSendRequest,
  onMessage,
  onViewProfile,
  loading = false,
}: MemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback className="bg-blue-500 text-white">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {member.name}
            </h3>
            <p className="text-sm text-gray-600 truncate mb-1">
              {member.job}
            </p>
            <Badge variant="secondary" className="text-xs">
              {member.role}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            {isConnected ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessage?.(member.id)}
                  className="flex items-center space-x-1"
                  disabled={loading}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewProfile?.(member.id)}
                  className="flex items-center space-x-1"
                  disabled={loading}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Portfolio</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => onSendRequest?.(member.id)}
                className="flex items-center space-x-1"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}