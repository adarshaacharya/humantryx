import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/wysiwig/rich-text-editor";
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
import {
  JOB_LOCATION_TYPES,
  COMMON_SKILLS,
  EXPERIENCE_LEVELS,
  SALARY_CURRENCIES,
  JOB_STATUSES,
} from "../../consts";
import { EMPLOYEE_DEPARTMENTS } from "@/server/db/consts";

// Create edit form schema directly
const editJobFormSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
  locationType: z.enum(["onsite", "remote", "hybrid"]),
  location: z.string().optional(),
  salaryRangeMin: z.number().optional(),
  salaryRangeMax: z.number().optional(),
  salaryCurrency: z.string(),
  experienceRequired: z.string().optional(),
  skills: z.array(z.string()),
  requirements: z.string().optional(),
  status: z.enum(["draft", "open", "closed"]),
});

type EditJobFormData = z.infer<typeof editJobFormSchema>;

interface EditJobDialogProps {
  job: {
    id: string;
    title: string;
    department: string;
    description: string;
    locationType: string;
    location?: string | null;
    salaryRangeMin?: number | null;
    salaryRangeMax?: number | null;
    salaryCurrency?: string | null;
    experienceRequired?: string | null;
    skills?: string[] | null;
    requirements?: string | null;
    status: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const [skillInput, setSkillInput] = useState("");

  const utils = api.useUtils();

  const form = useForm<EditJobFormData>({
    resolver: zodResolver(editJobFormSchema),
  });

  const updateJobMutation = api.recruitment.update.useMutation({
    onSuccess: () => {
      toast.success("Job posting updated successfully!");
      onOpenChange(false);
      void utils.recruitment.list.invalidate();
      void utils.recruitment.getStats.invalidate();
      void utils.recruitment.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job posting");
    },
  });

  // Reset form when job changes
  useEffect(() => {
    if (job && open) {
      form.reset({
        id: job.id,
        title: job.title || "",
        department: job.department || "",
        description: job.description || "",
        locationType:
          (job.locationType as "onsite" | "remote" | "hybrid") || "onsite",
        location: job.location || "",
        salaryRangeMin: job.salaryRangeMin || undefined,
        salaryRangeMax: job.salaryRangeMax || undefined,
        salaryCurrency: job.salaryCurrency || "USD",
        experienceRequired: job.experienceRequired || "",
        skills: job.skills || [],
        requirements: job.requirements || "",
        status: (job.status as "draft" | "open" | "closed") || "draft",
      });
    }
  }, [job, open, form]);

  const onSubmit = (data: EditJobFormData) => {
    updateJobMutation.mutate(data);
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

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
          <DialogDescription>Update the job posting details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
                      {JOB_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          {EMPLOYEE_DEPARTMENTS.map(
                            (dept: { value: string; label: string }) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ),
                          )}
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
              <Button type="submit" disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? "Updating..." : "Update Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Need to import z

// Already imported above
