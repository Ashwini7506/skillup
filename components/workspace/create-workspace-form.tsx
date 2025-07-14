"use client"

import { workspaceSchema } from '@/lib/schema';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner';

import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useRouter } from 'next/navigation';
import { createNewWorkspace } from '@/app/actions/workspace';
import Link from 'next/link';

export type CreateWorkspaceDataType = z.infer<typeof workspaceSchema>;

export const CreateWorkspaceform = () => {
    const [pending, setPending] = useState(false);
    const router = useRouter()
    
    const form = useForm<CreateWorkspaceDataType>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: "",
            description: "",
        }
    });

    const onSubmit = async (data: CreateWorkspaceDataType) => {
        try {
            setPending(true);
            const { data: res } = await createNewWorkspace(data);
            toast.success("Growthspace created successfully");
            router.push(`/workspace/${res?.id as string}`)
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold text-center mb-8">Step 2/2</h1>
                
                <Card className="w-full shadow-xl rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Create a New Growthspace</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Tell us a bit about your growthspace.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Growthspace Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter growthspace name" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Write a short description of your growthspace"
                                                    className="resize-none min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-3 justify-end pt-4">
                                    <Link href="/workspace/">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            disabled={pending}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button 
                                        type="submit" 
                                        disabled={pending}
                                        className="min-w-[140px]"
                                    >
                                        {pending ? "Creating..." : "Create growthspace"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};