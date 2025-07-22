// app/(protected)/make-a-wish/make-a-wish-client.tsx
'use client'

import { useRouter } from 'next/navigation'

// Define the prop types
type WorkspaceData = {
    workspace: {
        id: string;
        createdAt: Date;
        userId: string;
        workspaceId: string;
        accessLevel: any;
        workspace: {
            name: string;
        };
    }[];
} & {
    name: string;
    id: string;
    // ... other properties
} | null | undefined;

interface MakeAWishClientProps {
    workspaceData: WorkspaceData;
}

const MakeAWishClient = ({ workspaceData }: MakeAWishClientProps) => {
    const router = useRouter()

    const handleProjectsChoice = () => {
        if (workspaceData?.workspace && workspaceData.workspace.length > 0) {
            router.push(`/workspace/${workspaceData.workspace[0].workspaceId}`)
        }
    }

    const handleSprintChoice = () => {
        router.push('/sprint-explanation')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        What's Your Next Move? ✨
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose your path to level up your skills
                    </p>
                </div>

                {/* Choice Buttons */}
                <div className="space-y-6">
                    <button 
                        onClick={handleSprintChoice}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out"
                    >
                        <div className="relative z-10">
                            <div className="text-2xl font-semibold mb-2">
                                ⚡ Join Upcoming Sprint
                            </div>
                            <div className="text-green-100 text-lg">
                                Collaborate in time-boxed team challenges
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    </button>
                    <button 
                        onClick={handleProjectsChoice}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out"
                    >
                        <div className="relative z-10">
                            <div className="text-2xl font-semibold mb-2">
                                🚀 Start Building Projects
                            </div>
                            <div className="text-blue-100 text-lg">
                                Practice with hands-on coding challenges
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    </button>
                    
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">
                        Don't worry, you can always switch later!
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MakeAWishClient
