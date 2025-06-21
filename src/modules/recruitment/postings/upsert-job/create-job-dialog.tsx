"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { jobFormSchema, type JobFormData } from "../../schemas/job-form.schema";
import {
  JOB_LOCATION_TYPES,
  COMMON_SKILLS,
  EXPERIENCE_LEVELS,
  SALARY_CURRENCIES,
} from "../../consts";
import { EMPLOYEE_DEPARTMENTS } from "@/server/db/consts";
import { RichTextEditor } from "@/components/wysiwig/rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const [skillInput, setSkillInput] = useState("");
  const utils = api.useUtils();
  const currentEmployee = useCurrentEmployee();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      department: "",
      description: "",
      locationType: "onsite",
      location: "",
      salaryRangeMin: undefined,
      salaryRangeMax: undefined,
      salaryCurrency: "USD",
      experienceRequired: "",
      skills: [],
      requirements: "",
      status: "draft",
    },
  });

  const createJobMutation = api.recruitment.create.useMutation({
    onSuccess: () => {
      toast.success("Job posting created successfully!");
      form.reset();
      onOpenChange(false);
      void utils.recruitment.list.invalidate();
      void utils.recruitment.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create job posting");
    },
  });

  const onSubmit = (data: JobFormData) => {
    if (!currentEmployee?.id) {
      toast.error("Employee information not found");
      return;
    }

    const submitData = {
      ...data,
      createdByEmployeeId: currentEmployee.id,
    };

    createJobMutation.mutate(submitData);
  };

  const addSkill = (skill: string) => {
    const currentSkills = form.getValues("skills");
    if (skill && !currentSkills.includes(skill)) {
      form.setValue("skills", [...currentSkills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove),
    );
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Posting</DialogTitle>
          <DialogDescription>
            Create a new job posting to start attracting candidates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior Software Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYEE_DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JOB_LOCATION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <span className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                {type.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("locationType") !== "remote" && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. San Francisco, CA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Job Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">
                Salary Information (Optional)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salaryRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="80000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SALARY_CURRENCIES.map((currency) => (
                            <SelectItem
                              key={currency.value}
                              value={currency.value}
                            >
                              {currency.symbol} {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Experience Required */}
            <FormField
              control={form.control}
              name="experienceRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Required</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <FormDescription>
                    Add skills required for this position
                  </FormDescription>
                  <div className="space-y-3">
                    {/* Current Skills */}
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-destructive ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add Skill Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillInputKeyDown}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSkill(skillInput)}
                        disabled={!skillInput}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Common Skills */}
                    <div className="space-y-2">
                      <Label className="text-xs">Common Skills:</Label>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_SKILLS.slice(0, 10).map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => addSkill(skill)}
                            disabled={field.value.includes(skill)}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Requirements */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional requirements, qualifications, or preferences..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createJobMutation.isPending}>
                {createJobMutation.isPending ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
