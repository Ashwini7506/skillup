import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { ProjectTaskProps } from "@/utils/types";
import { DraggableProvided } from "@hello-pangea/dnd";
import { Card } from "../ui/card";
import Link from "next/link";
import { ProjectAvatar } from "./project-avatar";
import { Badge } from "../ui/badge";
import { ProfileAvatar } from "../profile-avatar";

interface DataProps {
    ref: (element?: HTMLElement | null) => void;
    task: ProjectTaskProps;
    provided: DraggableProvided;
}

export const ProjectCard = ({ ref, provided, task }: DataProps) => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();

    return <Card
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="mb-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
        <Link href={`/workspace/${workspaceId}/projects/${projectId}/${task.id}`}>
            <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100">{task.title}</h3>
        </Link>
        {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                {task.description}
            </p>
        )}

        <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
                <ProjectAvatar name={task.project.name} className="!size-7" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{task.project.name}</p>
            </div>
            <Badge variant={task.priority} className="text-xs px-2 py-1">{task.priority}</Badge>
        </div>

        <div className="flex items-center gap-3 mt-3">
            <ProfileAvatar
                url={task.assignedTo.image}
                name={task.assignedTo.name}
                className="!size-7"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.assignedTo.name}</p>
        </div>
    </Card>
}