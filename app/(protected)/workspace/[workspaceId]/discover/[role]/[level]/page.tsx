import { getRoleLabelFromSlug } from "@/utils/roleMap";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { DiscoverClient } from "@/components/discover/discoverClient";
import Tracker from "@/components/Tracker";

interface PageProps {
  params: Promise<{
    workspaceId: string;
    role: string;
    level: "noob" | "intermediate" | "advanced";
  }>;
}

export default async function DiscoverPage({ params }: PageProps) {
  const user = await userRequired();
  
  const { workspaceId, role: slug, level } = await params;
  const roleLabel = getRoleLabelFromSlug(slug);

  return (
    <main className="md:px-6 pb-8 space-y-6">
      <Tracker />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold capitalize">
          {level} {roleLabel} Projects
        </h1>
        <p className="text-muted-foreground">
          Discover projects tailored for {level}‑level {roleLabel}s.
        </p>
      </div>

      <DiscoverClient 
        workspaceId={workspaceId}
        role={slug}
        level={level}
        userId={user.user?.id as string}
      />
    </main>
  );
}
