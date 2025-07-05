"use client"

import { createNewProject } from "@/app/actions/project";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { projectSchema } from "@/lib/schema";
import { WorkspaceMembersProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
    workspaceMembers: WorkspaceMembersProps[];
}

export type ProjectDataType = z.infer<typeof projectSchema>;

export const CreateProjectForm = ({ workspaceMembers }: Props) => {
    const workspaceId = useWorkspaceId();
    const [pending, setPending] = useState(false);
    const router = useRouter();

    const form = useForm<ProjectDataType>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: "",
            description: "",
            memberAccess: [],
            workspaceId: workspaceId as string,
        },
    });

    const handleSubmit = async (data: ProjectDataType) => {
        try {

            setPending(true)

            await createNewProject(data)
            form.reset();
            toast.success("project created successfully")
            router.refresh()

        } catch (error) {
            console.log(error)

            toast.error("something went wrong")
        } finally {
            setPending(false)
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" className="size-5">
                    <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-xl p-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">
                        Create a New Project
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                        {/* Project Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Project name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write a short description of your project"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Member Access */}
                        <FormField
                            control={form.control}
                            name="memberAccess"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Access</FormLabel>
                                    <FormDescription className="text-xs text-muted-foreground mb-3">
                                        Select which Growthspace members should have access to this project
                                    </FormDescription>

                                    <div className="space-y-2">
                                        {workspaceMembers?.map((member) => (
                                            <div key={member?.userId} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={member.userId}
                                                    checked={field.value?.includes(member.userId)}
                                                    onCheckedChange={(checked) => {
                                                        const currentValue = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...currentValue, member.userId]);
                                                        } else {
                                                            field.onChange(
                                                                currentValue.filter((id) => id !== member.userId)
                                                            );
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={member.userId}
                                                    className="text-sm font-medium leading-none capitalize cursor-pointer"
                                                >
                                                    {member.user.name}{" "}
                                                    <span className="text-muted-foreground text-xs">
                                                        ({member.accessLevel.toLowerCase()})
                                                    </span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-2">
                            <Button type="button" variant="outline" disabled={pending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={pending}>
                                {pending ? "Creating..." : "Create Project"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
