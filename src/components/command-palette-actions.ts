import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Plus,
  LogIn,
  LogOut,
  Newspaper,
  Building,
  type LucideIcon,
} from "lucide-react";
import type { AppAbility } from "@/lib/casl/types";

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  category: "navigation" | "create" | "quick-action";
  keywords?: string[];
  permission?: (ability: AppAbility) => boolean;
}

export const getQuickActions = (_ability: AppAbility): QuickAction[] => [
  // Navigation Actions
  {
    id: "nav-dashboard",
    label: "Go to Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    category: "navigation",
    keywords: ["dashboard", "home", "overview"],
  },
  {
    id: "nav-employees",
    label: "Go to Employees",
    icon: Users,
    href: "/dashboard/employees",
    category: "navigation",
    keywords: ["employees", "staff", "team", "people"],
    permission: (ability) => ability.can("read", "Employee"),
  },
  {
    id: "nav-attendance",
    label: "Go to Attendance",
    icon: Clock,
    href: "/dashboard/attendance",
    category: "navigation",
    keywords: ["attendance", "clock", "time", "tracking"],
    permission: (ability) => ability.can("read", "Attendance"),
  },
  {
    id: "nav-leave",
    label: "Go to Leave Management",
    icon: Calendar,
    href: "/dashboard/leave",
    category: "navigation",
    keywords: ["leave", "vacation", "time off", "pto"],
    permission: (ability) => ability.can("read", "LeaveRequests"),
  },
  {
    id: "nav-payroll",
    label: "Go to Payroll",
    icon: DollarSign,
    href: "/dashboard/payroll",
    category: "navigation",
    keywords: ["payroll", "salary", "payment", "compensation"],
    permission: (ability) => ability.can("read", "Payroll"),
  },
  {
    id: "nav-documents",
    label: "Go to Documents",
    icon: FileText,
    href: "/dashboard/documents",
    category: "navigation",
    keywords: ["documents", "files", "resources"],
    permission: (ability) => ability.can("read", "Documents"),
  },
  {
    id: "nav-recruitment",
    label: "Go to Recruitment",
    icon: Briefcase,
    href: "/dashboard/recruitment",
    category: "navigation",
    keywords: ["recruitment", "hiring", "jobs", "candidates"],
    permission: (ability) => ability.can("read", "Recruitment"),
  },
  {
    id: "nav-news",
    label: "Go to News",
    icon: Newspaper,
    href: "/dashboard/news",
    category: "navigation",
    keywords: ["news", "announcements", "updates"],
  },
  {
    id: "nav-company",
    label: "Go to Company",
    icon: Building,
    href: "/dashboard/company",
    category: "navigation",
    keywords: ["company", "organization", "departments"],
  },

  // Create Actions
  {
    id: "create-leave",
    label: "Create Leave Request",
    icon: Plus,
    href: "/dashboard/leave/requests/new",
    category: "create",
    keywords: ["create", "new", "leave", "request", "time off"],
    permission: (ability) => ability.can("create", "LeaveRequests"),
  },
  {
    id: "create-job",
    label: "Create Job Posting",
    icon: Plus,
    href: "/dashboard/recruitment/jobs/new",
    category: "create",
    keywords: ["create", "new", "job", "posting", "hiring"],
    permission: (ability) => ability.can("create", "Recruitment"),
  },
  {
    id: "invite-employee",
    label: "Invite Employee",
    icon: Plus,
    href: "/dashboard/employees/invitations",
    category: "create",
    keywords: ["invite", "add", "employee", "new", "hire"],
    permission: (ability) => ability.can("create", "Employee"),
  },

  // Quick Actions
  {
    id: "clock-in",
    label: "Clock In",
    icon: LogIn,
    href: "/dashboard/attendance",
    category: "quick-action",
    keywords: ["clock in", "check in", "start work"],
    permission: (ability) => ability.can("create", "Attendance"),
  },
  {
    id: "clock-out",
    label: "Clock Out",
    icon: LogOut,
    href: "/dashboard/attendance",
    category: "quick-action",
    keywords: ["clock out", "check out", "end work"],
    permission: (ability) => ability.can("create", "Attendance"),
  },
  {
    id: "view-payroll",
    label: "View My Payroll",
    icon: DollarSign,
    href: "/dashboard/payroll",
    category: "quick-action",
    keywords: ["payroll", "salary", "payment", "my"],
    permission: (ability) => ability.can("read", "Payroll"),
  },
];

export const filterActionsByPermission = (
  actions: QuickAction[],
  ability: AppAbility,
): QuickAction[] => {
  return actions.filter((action) => {
    if (!action.permission) return true;
    return action.permission(ability);
  });
};

export const searchActions = (
  actions: QuickAction[],
  query: string,
): QuickAction[] => {
  if (!query) return actions;

  const lowerQuery = query.toLowerCase();
  return actions.filter((action) => {
    const labelMatch = action.label.toLowerCase().includes(lowerQuery);
    const keywordMatch = action.keywords?.some((keyword) =>
      keyword.toLowerCase().includes(lowerQuery),
    );
    return labelMatch || keywordMatch;
  });
};
