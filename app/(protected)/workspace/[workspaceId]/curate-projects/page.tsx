import { userRequired } from "@/app/data/user/is-user-authenticated";
import { CurateProjectForm } from "@/components/curateprojects/curate-projects-form";
import { Rocket } from "lucide-react";

interface PageProps {
  params: { workspaceId: string };
}

export default async function CuratedProjectsPage({ params }: PageProps) {
  await userRequired();
  const { workspaceId } = await params;

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-8 py-24 bg-gradient-to-b from-gray-50 to-white">
      <header className="relative">
        <div className="flex items-center justify-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 shadow-lg hover:scale-105 transition-transform duration-300">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="ml-6 text-4xl font-extrabold text-slate-700 tracking-wide">
            Kickstart Your Project!
          </h1>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-base text-gray-600 leading-relaxed">
            Unleash your creativity—curate tasks, choose your vibe (personal or community), and build something epic!
          </p>
        </div>
      </header>

      <CurateProjectForm workspaceId={workspaceId} />
    </main>
  );
}