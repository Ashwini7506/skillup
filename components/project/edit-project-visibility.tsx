"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { 
  Globe, 
  Lock, 
  Users, 
  ChevronDown, 
  Settings,
  Eye,
  EyeOff,
  Info 
} from "lucide-react";
import { toast } from "sonner";

interface EditProjectVisibilityProps {
  projectId: string;
  workspaceId: string;
  currentVisibility: string;
  onVisibilityChange?: (newVisibility: string) => void;
}

export const EditProjectVisibility = ({
  projectId,
  workspaceId,
  currentVisibility,
  onVisibilityChange,
}: EditProjectVisibilityProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(currentVisibility);
  const [localVisibility, setLocalVisibility] = useState(currentVisibility);

  const visibilityOptions = [
    {
      value: 'PUBLIC',
      label: 'Public',
      icon: Globe,
      description: 'Anyone can view this project',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      value: 'PERSONAL',
      label: 'Personal',
      icon: Lock,
      description: 'Only you can view this project',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      borderColor: 'border-gray-200',
    },
  ];

  const currentOption = visibilityOptions.find(option => option.value === localVisibility);
  const selectedOption = visibilityOptions.find(option => option.value === selectedVisibility);

  const handleVisibilityUpdate = async (newVisibility: string) => {
    setIsLoading(true);
    
    try {
      // Fixed API endpoint to match your route
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility: newVisibility,
          workspaceId: workspaceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project visibility');
      }

      // Update local state immediately
      setLocalVisibility(newVisibility);
      
      // Call the callback if provided
      if (onVisibilityChange) {
        onVisibilityChange(newVisibility);
      }

      toast.success(`Project visibility updated to ${newVisibility.toLowerCase()}`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating project visibility:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project visibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickToggle = () => {
    const newVisibility = localVisibility === 'PUBLIC' ? 'PERSONAL' : 'PUBLIC';
    handleVisibilityUpdate(newVisibility);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Quick toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
        onClick={handleQuickToggle}
        disabled={isLoading}
        title={`Make ${localVisibility === 'PUBLIC' ? 'personal' : 'public'}`}
      >
        {localVisibility === 'PUBLIC' ? (
          <EyeOff className="w-3 h-3" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
      </Button>

      {/* Advanced settings dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
            title="Advanced visibility settings"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Project Visibility Settings
            </DialogTitle>
            <DialogDescription>
              Control who can view and access this project. Changes take effect immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                Current visibility: <span className="font-medium">{currentOption?.label}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Choose visibility level:</label>
              <div className="space-y-2">
                {visibilityOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedVisibility === option.value;
                  const isCurrent = localVisibility === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedVisibility(option.value)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 transition-all duration-200
                        ${isSelected 
                          ? `${option.bgColor} ${option.borderColor} ring-2 ring-offset-1 ring-blue-500` 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }
                        ${isCurrent ? 'ring-1 ring-green-500' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 mt-0.5 ${isSelected ? option.color : 'text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isSelected ? option.color : 'text-gray-900'}`}>
                              {option.label}
                            </span>
                            {isCurrent && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleVisibilityUpdate(selectedVisibility)}
              disabled={isLoading || selectedVisibility === localVisibility}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                'Update Visibility'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Alternative simpler dropdown version
// export const EditProjectVisibilityDropdown = ({
//   projectId,
//   workspaceId,
//   currentVisibility,
//   onVisibilityChange,
// }: EditProjectVisibilityProps) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [localVisibility, setLocalVisibility] = useState(currentVisibility);

//   const visibilityOptions = [
//     { value: 'PUBLIC', label: 'Public', icon: Globe, color: 'text-blue-600' },
//     { value: 'PERSONAL', label: 'Personal', icon: Lock, color: 'text-gray-600' },
//     { value: 'TEAM', label: 'Team', icon: Users, color: 'text-green-600' },
//   ];

//   const currentOption = visibilityOptions.find(option => option.value === localVisibility);

//   const handleVisibilityChange = async (newVisibility: string) => {
//     if (newVisibility === localVisibility) return;
    
//     setIsLoading(true);
    
//     try {
//       // Fixed API endpoint to match your route
//       const response = await fetch(`/api/projects/${projectId}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           visibility: newVisibility,
//           workspaceId: workspaceId,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to update project visibility');
//       }

//       // Update local state immediately
//       setLocalVisibility(newVisibility);

//       if (onVisibilityChange) {
//         onVisibilityChange(newVisibility);
//       }

//       toast.success(`Project visibility updated to ${newVisibility.toLowerCase()}`);
//     } catch (error) {
//       console.error('Error updating project visibility:', error);
//       toast.error(error instanceof Error ? error.message : 'Failed to update project visibility');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
//           ) : (
//             <ChevronDown className="w-3 h-3" />
//           )}
//         </Button>
//       </DropdownMenuTrigger>
      
//       <DropdownMenuContent align="end" className="w-48">
//         <DropdownMenuLabel className="flex items-center gap-2">
//           <Settings className="w-3 h-3" />
//           Project Visibility
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
        
//         {visibilityOptions.map((option) => {
//           const Icon = option.icon;
//           const isCurrent = localVisibility === option.value;
          
//           return (
//             <DropdownMenuItem
//               key={option.value}
//               onClick={() => handleVisibilityChange(option.value)}
//               className={`flex items-center gap-2 ${isCurrent ? 'bg-blue-50' : ''}`}
//             >
//               <Icon className={`w-3 h-3 ${isCurrent ? option.color : 'text-gray-500'}`} />
//               <span className={isCurrent ? 'font-medium' : ''}>
//                 {option.label}
//               </span>
//               {isCurrent && (
//                 <span className="ml-auto text-xs text-blue-600">Current</span>
//               )}
//             </DropdownMenuItem>
//           );
//         })}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };