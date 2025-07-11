import {z} from "zod"


export const userSchema = z.object({
    name:z.string().min(2,"Name is required").max(200,"maximum is 200 characters"),
    about: z.string().optional(),
    job : z.string().min(1,"Job is required"),
    // industryType : z.string().min(1,"Industry type is required"),
    email : z.string().email("Invalid email Address"),
    role : z.string().min(1,"Role is required"),
    image : z.string().optional()
})

export const workspaceSchema = z.object({
     name:z.string().min(2,"Name is required").max(200,"maximum is 200 characters"),
    description: z.string().optional(),
})

export const projectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 2 characters" }),
  workspaceId: z.string(),
  description: z.string().optional(),
  memberAccess: z.array(z.string()).optional(),
  invitedEmails: z.array(z.string().email()).optional(),

  // ✅ Add these two
  role: z.string().min(1, "Role is required"),
  level: z.enum(["noob", "intermediate", "advanced"]),
});


export const taskFormSchema = z.object ( {
    title : z.string().min(1, "Title is required"),
    description : z.string().optional(),
    assigneeId : z.string().optional(),
    status : z.enum([
        "TODO",
        "IN_PROGRESS",
        "COMPLETED",
        "BLOCKED",
        "BACKLOG",
        "IN_REVIEW"
    ]),
    dueDate : z.date(),
    startDate : z.date(),
    priority : z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    attachments : z.
    array(
        z.object({
            name : z.string(),
            url : z.string(),
            type : z.enum(["IMAGE","PDF"])
        })
    )
    .optional(),
})