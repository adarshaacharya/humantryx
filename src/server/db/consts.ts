import type { orgMemberRole, invitationRole } from "./organizations";

export type OrgMemberRole = (typeof orgMemberRole.enumValues)[number];

export type InvitationRole = (typeof invitationRole.enumValues)[number];
