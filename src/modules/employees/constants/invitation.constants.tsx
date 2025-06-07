import { Badge } from "@/components/ui/badge";
import type { InvitationStatus } from "better-auth/plugins";
import { Calendar, Clock, CheckCircle, XCircle, Mail } from "lucide-react";

export const getInvitationStatusBadge = (status: InvitationStatus | null) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Accepted
        </Badge>
      );
    case "canceled":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="mr-1 h-3 w-3" />
          Canceled
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <Calendar className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Mail className="mr-1 h-3 w-3" />
          {status ?? "Unknown"}
        </Badge>
      );
  }
};

export function getInvitationStatusIcon(status: InvitationStatus | null) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "accepted":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "canceled":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "rejected":
      return <Calendar className="h-4 w-4 text-gray-600" />;
    default:
      return <Mail className="h-4 w-4 text-gray-600" />;
  }
}

// Status filter options for dropdown
export const INVITATION_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "canceled", label: "Canceled" },
  { value: "rejected", label: "Rejected" },
] as const;

// Sort options for dropdown
export const INVITATION_SORT_OPTIONS = [
  { value: "email-asc", label: "Email (A-Z)" },
  { value: "email-desc", label: "Email (Z-A)" },
  { value: "status-asc", label: "Status (A-Z)" },
  { value: "status-desc", label: "Status (Z-A)" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "createdAt-desc", label: "Newest First" },
  { value: "expiresAt-asc", label: "Expires Soon" },
  { value: "expiresAt-desc", label: "Expires Later" },
] as const;
