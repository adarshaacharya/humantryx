import { z } from "zod";

// Base schemas for organization actions
export const createOrganizationSchema = z.object({
  action: z.literal("create"),
  organizationData: z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
    slug: z
      .string()
      .min(2, "Organization slug must be at least 2 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),
  }),
  joinData: z
    .null()
    .or(z.undefined())
    .or(
      z.object({
        inviteCode: z.string().optional(),
      }),
    ),
});

export const joinOrganizationSchema = z.object({
  action: z.literal("join"),
  organizationData: z
    .null()
    .or(z.undefined())
    .or(
      z.object({
        name: z.string().optional(),
        slug: z.string().optional(),
      }),
    ),
  joinData: z.object({
    inviteCode: z.string().min(1, "Invite code is required"),
  }),
});

// Organization Selection Schema using discriminated union
export const organizationSelectionSchema = z.discriminatedUnion("action", [
  createOrganizationSchema,
  joinOrganizationSchema,
]);

export type OrganizationSelectionSchemaType = z.infer<
  typeof organizationSelectionSchema
>;
