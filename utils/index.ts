import { TaskStatus } from "@prisma/client";

export const taskStats = [
    {
        status : TaskStatus.TODO,
        label : "TO DO",
        color : "bg-blue-500",
    },
    {
        status : TaskStatus.IN_PROGRESS,
        label : "IN PROGRESS",
        color : "bg-yellow-500",
    },
    {
        status : TaskStatus.COMPLETED,
        label : "COMPLETED",
        color : "bg-green-500",
    },
    {
        status : TaskStatus.BLOCKED,
        label : "BLOCKED",
        color : "bg-grey-500",
    },
    {
        status : TaskStatus.BACKLOG,
        label : "BACKLOG",
        color : "bg-red-500",
    },
]

export const taskSatusVariant ={
    [TaskStatus.BLOCKED] : "#ef4444",
    [TaskStatus.TODO] : "#6366f1",
    [TaskStatus.IN_PROGRESS] : "#f59e0b",
    [TaskStatus.COMPLETED] : "#10b981",
    [TaskStatus.BACKLOG] : "#ec4899",
    [TaskStatus.IN_REVIEW] : "#a855f7",
    default : "6366f1"
}