// components/sprint/SprintLoadingStates.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Users, Trophy, Upload, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

// Hub Loading State
export function SprintHubSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 mr-4" />
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

// Story Tab Loading
export function StoryTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-40" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Team Tab Loading
export function TeamTabSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Ranking Tab Loading
export function RankingTabSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Uploads Tab Loading
export function UploadsTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded">
            <Skeleton className="h-8 w-8" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Error States
interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title, 
  description, 
  onRetry, 
  actionLabel = "Try Again",
  icon 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 p-3 bg-red-100 rounded-full">
        {icon || <AlertCircle className="h-8 w-8 text-red-600" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Specific Error States
export function NotEnrolledState() {
  return (
    <ErrorState
      title="Not Enrolled in Sprint"
      description="You haven't enrolled in any sprint cohort yet. Contact your administrator to join a sprint."
      icon={<Users className="h-8 w-8 text-blue-600" />}
    />
  );
}

export function NoTeamState() {
  return (
    <ErrorState
      title="No Team Assigned"
      description="You're enrolled in a sprint but haven't been assigned to a team yet. Please wait for team assignments."
      icon={<Users className="h-8 w-8 text-yellow-600" />}
    />
  );
}

export function SprintEndedState({ endDate }: { endDate: string }) {
  const formattedDate = new Date(endDate).toLocaleDateString();
  
  return (
    <ErrorState
      title="Sprint Completed"
      description={`This sprint ended on ${formattedDate}. Great job on completing your sprint journey!`}
      icon={<Trophy className="h-8 w-8 text-green-600" />}
    />
  );
}

// Empty States
export function EmptyUploadsState() {
  return (
    <div className="text-center py-12">
      <div className="mb-4 p-3 bg-gray-100 rounded-full inline-block">
        <Upload className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files Yet</h3>
      <p className="text-gray-600">
        Files uploaded to your project tasks will appear here.
      </p>
    </div>
  );
}

export function EmptyStoryState() {
  return (
    <div className="text-center py-12">
      <div className="mb-4 p-3 bg-gray-100 rounded-full inline-block">
        <BookOpen className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Story Available</h3>
      <p className="text-gray-600">
        The story content for this sprint is not yet available.
      </p>
    </div>
  );
}

// Countdown Component
interface CountdownProps {
  targetDate: string;
  title: string;
  description: string;
}

export function Countdown({ targetDate, title, description }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Started!');
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 inline-block">
          <div className="text-3xl font-bold mb-2">{timeRemaining}</div>
          <div className="text-sm opacity-90">Until Sprint Starts</div>
        </div>
      </div>
    </div>
  );
}

// Loading Page Component
export function SprintLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SprintHubSkeleton />
      </div>
    </div>
  );
}