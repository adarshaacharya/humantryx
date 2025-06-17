"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Calendar,
  Clock,
  Shield,
  UserCheck,
  Briefcase,
} from "lucide-react";
import type { InvitationWithDetails } from "../../types/invitation.types";
import {
  getInvitationStatusBadge,
  getInvitationStatusIcon,
} from "../../constants/invitation.constants";

interface InvitationDetailsDialogProps {
  invitation: InvitationWithDetails | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationDetailsDialog({
  invitation,
  isOpen,
  onOpenChange,
}: InvitationDetailsDialogProps) {
  if (!invitation) {
    return null;
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitation Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this invitation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with email and status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{invitation.email}</h3>
              {invitation.employeeName && (
                <p className="text-muted-foreground">
                  {invitation.employeeName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getInvitationStatusIcon(invitation.status)}
              {getInvitationStatusBadge(invitation.status)}
            </div>
          </div>

          <Separator />

          {/* Invitation Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Invitation Information
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Role:</span>
                <Badge variant="outline" className="capitalize">
                  {invitation.role ?? "Member"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Status:</span>
                <span className="text-sm font-medium capitalize">
                  {invitation.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Invitation ID:
                </span>
                <span className="font-mono text-sm">{invitation.id}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Inviter Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <UserCheck className="h-4 w-4" />
              Invited By
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Name:</span>
                <span className="text-sm">
                  {invitation.inviterName ?? "Unknown"}
                </span>
              </div>
              {invitation.inviterEmail && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Email:</span>
                  <span className="text-sm">{invitation.inviterEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Employee Information (if linked) */}
          {invitation.employeeId && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  Employee Information
                </h4>
                <div className="space-y-2 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Name:</span>
                    <span className="text-sm">
                      {invitation.employeeName ?? "Not provided"}
                    </span>
                  </div>
                  {invitation.employeeDesignation && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Designation:
                      </span>
                      <span className="text-sm">
                        {invitation.employeeDesignation}
                      </span>
                    </div>
                  )}
                  {invitation.employeeDepartment && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Department:
                      </span>
                      <span className="text-sm">
                        {invitation.employeeDepartment}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Employee ID:
                    </span>
                    <span className="font-mono text-sm">
                      {invitation.employeeId}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timeline Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="space-y-2 pl-6">
              {invitation.createdAt && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Invited:
                  </span>
                  <span className="text-sm">
                    {format(new Date(invitation.createdAt), "PPP 'at' p")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {isExpired ? "Expired:" : "Expires:"}
                </span>
                <span
                  className={`text-sm ${isExpired ? "font-medium text-red-600" : ""}`}
                >
                  {format(new Date(invitation.expiresAt), "PPP 'at' p")}
                </span>
              </div>
              {isExpired && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      This invitation has expired
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
