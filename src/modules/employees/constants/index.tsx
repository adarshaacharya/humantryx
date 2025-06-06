import { Badge } from "@/components/ui/badge";
import type { InvitationStatus } from "better-auth/plugins";
import { User, UserCheck } from "lucide-react";

export const getInvitationStatusBadge = (status: InvitationStatus | null) => {
  switch (status) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Accepted
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Pending
        </Badge>
      );
    case "canceled":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Canceled
        </Badge>
      );

    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};


export function getInvitationStatusIcon(status: InvitationStatus | null) {
  switch (status) {
    case "accepted":
      return <UserCheck className="h-4 w-4 text-green-600" />;
    case "pending":
      return <UserCheck className="h-4 w-4 text-yellow-600" />;
    case "canceled":
      return <User className="h-4 w-4 text-red-600" />;
    default:
      return <User className="h-4 w-4 text-gray-600" />;
  }
}