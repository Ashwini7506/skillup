import { ProjectProps } from "@/utils/types";
import { File, Task, User } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ProjectAvatar } from "../project/project-avatar";
import { ProfileAvatar } from "../profile-avatar";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { EditTaskDialog } from "./edit-task-dialog";
import { Paperclip } from "lucide-react";

interface TaskProps {
    task: Task & {
        assignedTo: User;
        project: ProjectProps;
        attachments: File[];
    }
}

export const TaskDetails = ({ task }: TaskProps) => {
    return <Card className="overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start p-6 bg-gray-150">
            <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-muted-foreground">Task Name : {task?.title}</CardTitle>
                <div className="flex items-center gap-3">
                    <ProjectAvatar name={task?.project.name} className="w-6 h-6" />
                    <p className="text-muted-foreground">
                        {task?.project.name}
                    </p>
                </div>
            </div>
            <div className="w-full md:w-auto flex flex-col items-end gap-3">
                <div className="w-full md:w-auto mt-4 md:mt-0">
                    <EditTaskDialog
                        key={new Date().getTime()}
                        task={task}
                        project={task.project}
                    />
                </div>
                <div className="text-right">
                    <span className="text-sm text-muted-foreground font-medium block">Assigned To:</span>
                    <div className="flex items-center gap-2 justify-end">
                        <ProfileAvatar
                            url={task.assignedTo.image || undefined}
                            name={task.assignedTo.name}
                            className="w-8 h-8"
                        />
                        <span className="text-sm font-medium block text-muted-foreground">{task.assignedTo.name}</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <Separator className="my-2" />
        <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
                <h4 className="text-lg font-semibold text-muted-foreground">Description</h4>
                <p className="text-muted-foreground">{task.description || "No description"}</p>
            </div>
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-muted-foreground">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={task.status} className="mt-1 text-sm">{task.status}</Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="mt-1 font-medium text-muted-foreground">
                            {format(task.dueDate, "MMM d, yyyy")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <Badge variant={task.priority} className="mt-1 text-sm">{task.priority}</Badge>
                    </div>
                </div>
            </div>
            <div>
                <h4>Attachments :</h4>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                    {task.attachments?.map((file) => (
                        <div key={file.id} className="relative group cursor-pointer">
                            <Image
                                src={file.type === "PDF" ?  "/pdf.png":file.url }
                                alt={"attachment"}
                                width={80}
                                height={120}
                                className="w-full h-48 object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <a href={file.url} target="_blank" rel="noopener noreferror"><span className="text-white text-sm">View</span></a>
                            </div>
                        </div>
                    ))}
                </div>
                {task.attachments.length === 0 && (
                    <div className="text-sm text-gray-500 flex items-center justify-center h-16 bg-gray-50 rounded-md mt-4">
                        <Paperclip size={16} className="mr-2" /> No attachments found
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
}