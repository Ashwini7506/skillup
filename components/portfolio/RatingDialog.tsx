// components/portfolio/RatingDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface RatingDialogProps {
  userId: string;
}

export function RatingDialog({ userId }: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRating = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/portfolio/${userId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: 'Decision Maker',
          rating,
          raterId: 'current-user-id' // In a real app, get this from auth
        })
      });

      if (!response.ok) {
        toast.error('Failed to submit rating');
      }

      // Show success message
      console.log(`Rating ${rating} submitted for user ${userId}`);
      setRating(0);
      
      // Optionally refresh the page or update the UI
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2">
          Rate Decision Making
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Decision Making Skills</DialogTitle>
          <DialogDescription>
            Rate this user's decision-making abilities based on your collaboration experience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="p-1 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {rating === 0 ? 'Click to rate' : `You rated: ${rating} star${rating > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setRating(0)}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              onClick={submitRating}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}