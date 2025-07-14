import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpDown,
  EllipsisVertical,
  Eye,
  Paperclip,
} from "lucide-react";

import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DropdownMenu,
         DropdownMenuContent,
         DropdownMenuItem,
         DropdownMenuSeparator,
         DropdownMenuTrigger } from "../ui/dropdown-menu";

import { ProjectAvatar } from "./project-avatar";
import { ProfileAvatar } from "../profile-avatar";
import { DeleteTask } from "../task/delete-task";

// ────────────────────────────────────────────────────────────
//  Table item type  (extend Project with workspaceId field)
// ────────────────────────────────────────────────────────────
export type TaskTableItem = {
  id: string;                 // taskId
  title: string;
  status: string;
  priority: string;
  dueDate: Date;
  createdAt: Date;
  assignedTo: { name: string; image?: string };
  project: {
    id: string;               // projectId
    workspaceId: string;      // workspaceId
    name: string;
    accessLevel: "OWNER" | "MEMBER" | "VIEWER";
  };
  attachments: string[];
};

export const columns: ColumnDef<TaskTableItem>[] = [
  // ▸ Row‑select checkbox
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label={`select row ${row.id}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // ▸ Task title
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Task Title <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { project, id: taskId } = row.original;
      const title = row.getValue("title") as string;

      return (
        <Link
          href={`/workspace/${project.workspaceId}/projects/${project.id}/${taskId}`}
        >
          <div className="flex items-center gap-2">
            <ProjectAvatar name={title} />
            <span className="text-sm font-medium capitalize xl:text-base">
              {title}
            </span>
          </div>
        </Link>
      );
    },
  },

  // ▸ Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status as any}>
          {status === "IN_Progress" ? "IN PROGRESS" : status}
        </Badge>
      );
    },
  },

  // ▸ Priority
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.getValue("priority") as string}
      </Badge>
    ),
  },

  // ▸ Created At
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("createdAt") as string), "MMM dd, yyyy")}</div>
    ),
  },

  // ▸ Due Date
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("dueDate") as string), "MMM dd, yyyy")}</div>
    ),
  },

  // ▸ Assigned To
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const assigned = row.getValue("assignedTo") as {
        name: string;
        image?: string;
      };
      return (
        <div className="flex items-center gap-2">
          <ProfileAvatar
            name={assigned?.name || "Unassigned"}
            url={assigned?.image}
          />
          <span>{assigned?.name || "Unassigned"}</span>
        </div>
      );
    },
  },

  // ▸ Attachments
  {
    accessorKey: "attachments",
    header: "Attachments",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Paperclip className="w-4 h-4" />
        {(row.getValue("attachments") as string[])?.length || 0}
      </div>
    ),
  },

  // ▸ Action menu
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { id: taskId, project } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-30" align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/workspace/${project.workspaceId}/projects/${project.id}/${taskId}`}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View Task
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild className="p-0">
            <DeleteTask
              taskId={taskId}
              projectId={project.id}
              workspaceId={project.workspaceId}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];