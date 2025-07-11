import { getUserWorkspaces } from '@/app/data/workspace/get-user-workspace';
import { Navbar } from '@/components/navbar';
import { AppSidebarContainer } from '@/components/sidebar/app-sidebar-container';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import React from 'react';
import { SubscriptionGate } from '@/components/subscription-gate'; // ✅ import gate

interface Props {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

const WorkspaceIdLayout = async ({ children, params }: Props) => {
  const { workspaceId } = await params;
  const { data } = await getUserWorkspaces();

  if (!data?.onboardingCompleted && !data?.workspace) {
    redirect('/create-workspace');
  } else if (!data?.onboardingCompleted) {
    redirect('/onboarding');
  }

  return (
    <SidebarProvider>
      {/* ----- MAIN FLEX WRAPPER ----- */}
      <div className="flex w-full h-screen bg-background">
        {/* Sidebar */}
        <AppSidebarContainer data={data as any} workspaceId={workspaceId} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          {/* Combined header with sidebar trigger and navbar */}
          <div className="sticky top-0 bg-background z-10 border-b">
            {/* Top row with just the toggle button - minimal height */}
            <div className="flex items-center px-3 py-2">
              <SidebarTrigger />
            </div>

            {/* Navbar directly below */}
            <div className="px-0">
              <Navbar
                id={data?.id}
                name={data?.name as string}
                image={data?.image as string}
                email={data?.email as string}
              />
            </div>
          </div>

          {/* ✅ Wrap gated content */}
          <SubscriptionGate>
            <div className="p-0 pt-2 md:p-4">{children}</div>
          </SubscriptionGate>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WorkspaceIdLayout;
