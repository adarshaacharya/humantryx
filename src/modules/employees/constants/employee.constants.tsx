import { Badge } from "@/components/ui/badge";
import type { EmployeeStatus } from "@/server/db/consts";
import { Calendar, Clock, CheckCircle, XCircle, Mail } from "lucide-react";

export const getEmployeeStatusBadge = (
  status: EmployeeStatus | "all" | null,
) => {
  switch (status) {
    case "invited":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Invited
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case "on_leave":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="mr-1 h-3 w-3" />
          On Leave
        </Badge>
      );
    case "terminated":
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <Calendar className="mr-1 h-3 w-3" />
          Terminated
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

export function getEmployeeStatusIcon(status: EmployeeStatus | "all") {
  switch (status) {
    case "invited":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "on_leave":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "terminated":
      return <Calendar className="h-4 w-4 text-gray-600" />;
    default:
      return <Mail className="h-4 w-4 text-gray-600" />;
  }
}
