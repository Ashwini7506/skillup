// components/sprint/IntroStoryWrapper.tsx
'use client';

// import { useState, useEffect } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, X, Volume2, VolumeX } from 'lucide-react';

interface IntroStoryWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  videoUrl?: string;
  script?: any;
  mode?: 'first-time' | 'replay';
  teamName?: string;
}

interface DialogueStep {
  character: string;
  text: string;
  characterImage?: string;
}

export default function IntroStoryWrapper({
  isOpen,
  onClose,
  onComplete,
  videoUrl,
  script,
  mode = 'first-time',
  teamName = 'Team',
}: IntroStoryWrapperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDialogueStarted, setIsDialogueStarted] = useState(false);

  // Parse script into dialogue steps
  const dialogueSteps: DialogueStep[] = script?.dialogue || [
    {
      character: 'System',
      text: `Welcome to the sprint, ${teamName}! Your journey begins now.`,
    },
    {
      character: 'Mentor',
      text: 'Over the next few days, you\'ll work together to build something amazing. Each chapter will unlock new challenges and opportunities.',
    },
    {
      character: 'System',
      text: 'Ready to begin? Click continue to start your first chapter.',
    },
  ];

  const resetState = () => {
    setCurrentStep(0);
    setIsVideoPlaying(false);
    setIsVideoEnded(false);
    setIsDialogueStarted(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    setIsVideoPlaying(false);
    if (dialogueSteps.length > 0) {
      setIsDialogueStarted(true);
    }
  };

  const handleNext = () => {
    if (currentStep < dialogueSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (mode === 'first-time') {
      onComplete?.();
    }
    onClose();
  };

  const handleSkipVideo = () => {
    setIsVideoEnded(true);
    setIsVideoPlaying(false);
    if (dialogueSteps.length > 0) {
      setIsDialogueStarted(true);
    }
  };

  const currentDialogue = dialogueSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-gradient-to-br from-slate-900 to-slate-800">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {mode === 'replay' ? 'Sprint Introduction - Replay' : 'Welcome to Your Sprint!'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 pt-0">
          {/* Video Section */}
          {videoUrl && !isDialogueStarted && (
            <div className="relative mb-6 rounded-lg overflow-hidden bg-black">
              <video
                className="w-full h-64 object-cover"
                src={videoUrl}
                controls
                muted={isMuted}
                autoPlay={mode === 'first-time'}
                onEnded={handleVideoEnd}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                {mode === 'first-time' && !isVideoEnded && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSkipVideo}
                    className="bg-black/50 hover:bg-black/70"
                  >
                    Skip
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Dialogue Section */}
          {(isDialogueStarted || !videoUrl) && (
            <div className="space-y-6">
              {/* Character and Dialogue */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  {currentDialogue?.characterImage && (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {currentDialogue.character[0]}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {currentDialogue?.character}
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {currentDialogue?.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center">
                <div className="flex gap-2">
                  {dialogueSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-blue-500'
                          : index < currentStep
                          ? 'bg-blue-300'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="text-white hover:bg-white/10"
                >
                  Previous
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Step {currentStep + 1} of {dialogueSteps.length}
                  </p>
                </div>

                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {currentStep === dialogueSteps.length - 1 ? 'Start Sprint' : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {/* No Video, No Dialogue - Direct Start */}
          {!videoUrl && !isDialogueStarted && dialogueSteps.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Your Sprint!
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                You're ready to begin your sprint journey. Click below to start your first chapter.
              </p>
              <Button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Start Sprint
              </Button>
            </div>
          )}
        </div>

        {/* Mode Indicator */}
        {mode === 'replay' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium">
            REPLAY MODE
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// hooks/use-intro-story.ts




interface UseIntroStoryProps {
  onComplete?: () => void;
  videoUrl?: string;
  script?: any;
  teamName?: string;
}

export function useIntroStory({
  onComplete,
  videoUrl,
  script,
  teamName,
}: UseIntroStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'first-time' | 'replay'>('first-time');

  const openIntro = useCallback((replayMode = false) => {
    setMode(replayMode ? 'replay' : 'first-time');
    setIsOpen(true);
  }, []);

  const closeIntro = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleComplete = useCallback(() => {
    onComplete?.();
    setIsOpen(false);
  }, [onComplete]);

  return {
    isOpen,
    mode,
    openIntro,
    closeIntro,
    handleComplete,
    IntroStoryWrapper: useCallback(
      (props: any) => (
        <IntroStoryWrapper
          isOpen={isOpen}
          onClose={closeIntro}
          onComplete={handleComplete}
          videoUrl={videoUrl}
          script={script}
          mode={mode}
          teamName={teamName}
          {...props}
        />
      ),
      [isOpen, closeIntro, handleComplete, videoUrl, script, mode, teamName]
    ),
  };
}