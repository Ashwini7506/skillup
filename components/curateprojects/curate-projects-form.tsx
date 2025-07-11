"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import joblists from "@/utils/joblists";
import { createCuratedProject } from "@/app/actions/curateprojects/create-curated-project";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Eye, EyeOff, Plus, X, Sparkles, Target, Users, Zap, ChevronDown, Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "Project name is required"),
  description: z.string().optional(),
  visibility: z.enum(["PERSONAL", "PUBLIC"]),
  role: z.string().optional(),
  difficulty: z.enum(["NOOB", "INTERMEDIATE", "ADVANCED"]).optional(),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1, "Task title required"),
        description: z.string().optional(),
        attachments: z
          .array(
            z.object({
              name: z.string(),
              url: z.string().url(),
              type: z.enum(["IMAGE", "PDF"]),
            })
          )
          .optional(),
      })
    )
    .min(1, "Add at least one task"),
}).refine(
  (d) => d.visibility === "PERSONAL" || (d.role && d.difficulty),
  { message: "Role & difficulty required for public projects", path: ["role"] }
);

type FormValues = z.infer<typeof schema>;

export function CurateProjectForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { visibility: "PERSONAL", tasks: [{ title: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tasks" });
  const visibility = watch("visibility");
  const projectName = watch("name");

  async function onSubmit(values: FormValues) {
    try {
      const projectId = await createCuratedProject(values, workspaceId);
      toast.success("Project created successfully! 🎉");
      router.push(`/workspace/${workspaceId}/projects/${projectId}`);
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  }

  const difficultyConfig = {
    NOOB: { color: "bg-green-500", icon: "🌱", label: "Beginner" },
    INTERMEDIATE: { color: "bg-yellow-500", icon: "⚡", label: "Intermediate" },
    ADVANCED: { color: "bg-red-500", icon: "🔥", label: "Advanced" },
  };

  const steps = [
    { title: "Project Details", icon: Target },
    { title: "Visibility & Role", icon: visibility === "PUBLIC" ? Users : Eye },
    { title: "Tasks", icon: Zap },
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-600 to-gray-700 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-slate-700 to-gray-800 bg-clip-text text-transparent mb-6">
            {projectName ? `Building "${projectName}"` : "Let's Create Something Amazing"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your ideas into actionable projects with our intuitive project builder
          </p>
        </div>

        {/* Layout with Sidebar and Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar for Steps */}
          <aside className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Your Journey</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      index <= currentStep
                        ? "bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-md"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      index <= currentStep ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Form Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Step 1: Project Details */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-slate-600 to-gray-700 rounded-full"></div>
                    Project Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <Input {...register("name")} placeholder="Enter your project name..." className="w-full" />
                      {errors.name && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="w-4 h-4" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Vision / Description</label>
                      <Textarea
                        {...register("description")}
                        placeholder="Describe your project vision and goals..."
                        rows={4}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Visibility & Role */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-slate-600 to-gray-700 rounded-full"></div>
                    Project Visibility
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label
                      className={`relative cursor-pointer group transition-all duration-300 ${
                        visibility === "PERSONAL" ? "transform scale-105" : "hover:scale-102"
                      }`}
                    >
                      <input type="radio" {...register("visibility")} value="PERSONAL" className="sr-only" />
                      <div
                        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 transition-all duration-300 hover:shadow-lg border-2 ${
                          visibility === "PERSONAL"
                            ? "border-slate-400 bg-gradient-to-br from-slate-50 to-slate-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Eye
                            className={`w-8 h-8 ${visibility === "PERSONAL" ? "text-slate-600" : "text-gray-500"}`}
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                              visibility === "PERSONAL" ? "border-slate-500 bg-slate-500" : "border-gray-300"
                            }`}
                          >
                            {visibility === "PERSONAL" && (
                              <div className="w-full h-full bg-white rounded-full scale-50 transition-transform duration-200"></div>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Project</h3>
                        <p className="text-gray-600 text-sm">Keep it private, just for you</p>
                      </div>
                    </label>
                    <label
                      className={`relative cursor-pointer group transition-all duration-300 ${
                        visibility === "PUBLIC" ? "transform scale-105" : "hover:scale-102"
                      }`}
                    >
                      <input type="radio" {...register("visibility")} value="PUBLIC" className="sr-only" />
                      <div
                        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 transition-all duration-300 hover:shadow-lg border-2 ${
                          visibility === "PUBLIC"
                            ? "border-slate-400 bg-gradient-to-br from-slate-50 to-slate-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Users
                            className={`w-8 h-8 ${visibility === "PUBLIC" ? "text-slate-600" : "text-gray-500"}`}
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                              visibility === "PUBLIC" ? "border-slate-500 bg-slate-500" : "border-gray-300"
                            }`}
                          >
                            {visibility === "PUBLIC" && (
                              <div className="w-full h-full bg-white rounded-full scale-50 transition-transform duration-200"></div>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Public Project</h3>
                        <p className="text-gray-600 text-sm">Share with the community</p>
                      </div>
                    </label>
                  </div>
                  {visibility === "PUBLIC" && (
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-600" />
                        Public Project Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Job Role</label>
                          <div className="relative">
                            <select
                              {...register("role", { required: true })}
                              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                            >
                              <option value="">Select a role...</option>
                              {joblists.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                          {errors.role && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <X className="w-4 h-4" />
                              {errors.role.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                          <div className="relative">
                            <select
                              {...register("difficulty", { required: true })}
                              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
                            >
                              <option value="">Select difficulty...</option>
                              {Object.entries(difficultyConfig).map(([key, config]) => (
                                <option key={key} value={key}>
                                  {config.icon} {config.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                          {errors.difficulty && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <X className="w-4 h-4" />
                              {errors.difficulty.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Tasks */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
                      <div className="w-2 h-8 bg-gradient-to-b from-slate-600 to-gray-700 rounded-full"></div>
                      Project Tasks
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                      {fields.length} {fields.length === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
                    {fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 group hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                            <h4 className="font-semibold text-gray-800">Task {idx + 1}</h4>
                          </div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Task Title</label>
                            <Input
                              {...register(`tasks.${idx}.title` as const)}
                              placeholder="Enter task title..."
                              className="w-full"
                            />
                            {errors.tasks?.[idx]?.title && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                <X className="w-4 h-4" />
                                {errors.tasks[idx]?.title?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <Textarea
                              {...register(`tasks.${idx}.description` as const)}
                              placeholder="Describe this task..."
                              rows={3}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ title: "" })}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Task
                  </Button>
                  {errors.tasks && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <X className="w-4 h-4" />
                      {errors.tasks.message as string}
                    </p>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-10 border-t border-gray-200">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handlePrevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="button" onClick={handleNextStep} className="ml-auto">
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Your Project...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Create Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}