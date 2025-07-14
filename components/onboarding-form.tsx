"use client"

import { userSchema } from '@/lib/schema';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from './ui/form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './ui/select';

import joblists from '@/utils/joblists';
import rolelists from '@/utils/rolelists';
import { Textarea } from './ui/textarea';
import { toast, Toaster } from 'sonner';
import { createUser } from '@/app/actions/user';

interface Props {
    name: string;
    email: string;
    image?: string;
}

export type UserDataType = z.infer<typeof userSchema>;

export const Onboardingform = ({ name, email, image }: Props) => {
    const [pending, setPending] = useState(false);

    const form = useForm<UserDataType>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            about: "",
            name: name || "",
            email: email,
            image: image || "",
            role: "",
            job: "", // Add this line to fix the controlled/uncontrolled error
            // industryType: "",
        }
    });

    const onSubmit = async (data: UserDataType) => {
        try {
            setPending(true);
            await createUser(data);
            toast.success("Keep browser scale close to 80% for best experience")
        } catch (error) {
            console.log(error)
            toast.error("Please make a growthspace account to continue")
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold text-center mb-8">Step 1/2</h1>
                <Card className="w-full shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to SkillUp</CardTitle>
                    <CardDescription>
                        Tell us a bit about you!
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Full Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter full name" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-row gap-2">
                                <div className="w-full">
                                    <FormField
                                        control={form.control}
                                        name="job"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Intended</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter job title" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-full">
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {rolelists.map((role) => (
                                                            <SelectItem key={role} value={role}>
                                                                {role}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Let the world know who you are" 
                                                className='resize-none'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Submit */}
                            <Button type="submit" disabled={pending} className="w-full">
                                Submit
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};