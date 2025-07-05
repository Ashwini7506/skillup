"use client"

import { $Enums, TaskStatus } from "@prisma/client"
import { ProjectTaskProps, Column } from "@/utils/types"
import { useCallback, useEffect, useState } from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { cn } from "@/lib/utils"
import { taskSatusVariant } from "@/utils"
import { useRouter } from "next/navigation"
import { Separator } from "../ui/separator"
import { ProjectCard } from "./project-card"
import { db } from "@/lib/db"
import { updateTaskPosition } from "@/app/actions/task"

const COLUMN_TITLES: Record<$Enums.TaskStatus, string> = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    BLOCKED: "Blocked",
    BACKLOG: "Backlog",
    IN_REVIEW: "In Review",
}

export const Projectkanban = ({ initialTasks }: { initialTasks: ProjectTaskProps[] }) => {
    const router = useRouter()
    if (initialTasks.length === 0) return null

    const [columns, setColumns] = useState<Column[]>([]);

    useEffect(() => {
        const initialColumn: Column[] = Object.entries(COLUMN_TITLES).map(([status, title]) => ({
            id: status as TaskStatus,
            title,
            tasks: initialTasks.filter(task => task.status === status).sort((a, b) => a.position - b.position)
        }));
        setColumns(initialColumn);
    }, [initialTasks]);

    const onDragEnd = useCallback(
        async (result: DropResult) => {
            const { destination, source } = result

            if (!destination) return
            const newColums = [...columns]


            const sourceColumn = newColums.find(col => col.id === source.droppableId)
            const destColumn = newColums.find(col => col.id === destination.droppableId)

            if (!sourceColumn || !destColumn) return

            const [movedTask] = sourceColumn.tasks.splice(source.index, 1);

            const destinationTask = destColumn.tasks;
            let newPosition: number

            if (destinationTask.length === 0) {
                newPosition = 1000;
            } else if (destination.index === 0) {
                newPosition = destinationTask[0].position - 1000;
            } else if (destination.index === destinationTask.length) {
                newPosition = destinationTask[destinationTask.length - 1].position + 1000
            } else {
                newPosition = (destinationTask[destination.index - 1].position + destinationTask[destination.index].position) / 2
            }

            const updatedTask = {
                ...movedTask,
                position: newPosition,
                status: destination.droppableId as TaskStatus
            };

            destColumn.tasks.splice(destination.index, 0, updatedTask);

            setColumns(newColums)

            try {
                await updateTaskPosition(
                    movedTask.id,
                    newPosition,
                    destination.droppableId as TaskStatus
                )
            } catch (error) {
                console.log(error)
            }
        }, [columns]
    )

    return <div className="flex gap-4 h-full md:px-4 overflow-x-auto p-4 bg-white dark:bg-gray-900">
        <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column) => (
                <div
                    key={column.id}
                    className="flex flex-col min-w-[260px] w-[280px] bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-4"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: taskSatusVariant[column.id as TaskStatus] }}
                        />
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h2>
                    </div>
                    <Separator className="bg-gray-200 dark:bg-gray-700 mb-4" />
                    <Droppable droppableId={column.id}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="flex-1 min-h-[200px] p-2"
                            >
                                {column.tasks?.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <ProjectCard
                                                ref={provided.innerRef}
                                                provided={provided}
                                                task={task}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            ))}
        </DragDropContext>
    </div>
}