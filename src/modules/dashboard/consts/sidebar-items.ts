import type { AppAbility } from "@/lib/casl/types";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  UserPlus,
  Clock,
  Building,
  Sparkles,
} from "lucide-react";

type MenuItem = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  enabled?: boolean;
  submenu?: {
    title: string;
    href: string;
    enabled?: boolean;
  }[];
};

export const getMenuItems = (ability: AppAbility) => {
  const MENU_ITEMS: MenuItem[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      enabled: true,
    },
    {
      title: "Employees",
      icon: Users,
      href: "/dashboard/employees",
      enabled: ability.can("manage", "Employee"),
      submenu: [
        {
          title: "All Employees",
          href: "/dashboard/employees",
          enabled: ability.can("read", "Employee"),
        },
        {
          title: "Invitations",
          href: "/dashboard/employees/invitations",
          enabled: ability.can("create", "Employee"),
        },
      ],
    },
    {
      title: "Attendance",
      icon: Clock,
      href: "/dashboard/attendance",
      enabled: ability.can("read", "Attendance"),
      submenu: [
        {
          title: "My Attendance",
          href: "/dashboard/attendance",
          enabled: ability.can("read", "Attendance"),
        },
        {
          title: "Manage Attendance",
          href: "/dashboard/attendance/manage",
          enabled:
            ability.can("manage", "Attendance") ||
            ability.can("create", "Attendance"),
        },
      ],
    },
    {
      title: "Leave Management",
      icon: Calendar,
      href: "/dashboard/leaves",
      enabled: ability.can("read", "LeaveRequests"),
      submenu: [
        {
          title: "My Leaves",
          href: "/dashboard/leaves",
          enabled: ability.can("read", "LeaveRequests"),
        },
        {
          title: "Manage Leaves Balance",
          href: "/dashboard/leaves/manage",
          enabled: ability.can("manage", "LeaveRequests"),
        },
        {
          title: "Leave Requests",
          href: "/dashboard/leaves/requests",
          enabled: ability.can("manage", "LeaveRequests"),
        },
        {
          title: "Leave Policies",
          href: "/dashboard/leaves/policies",
          enabled: ability.can("read", "LeavePolicies"),
        },
      ],
    },
    {
      title: "Payroll",
      icon: DollarSign,
      href: "/dashboard/payroll",
      enabled: ability.can("read", "Payroll"),
      submenu: [
        {
          title: "Salary Management",
          href: "/dashboard/payroll",
          enabled: ability.can("create", "Payroll"),
        },
        {
          title: "Payslips",
          href: "/dashboard/payroll/payslips",
          enabled: ability.can("read", "Payroll"),
        },
      ],
    },
    {
      title: "AI Features",
      icon: Sparkles,
      href: "/dashboard/ai",
      enabled: ability.can("read", "AI"),
      submenu: [
        {
          title: "Resume Screening",
          href: "/dashboard/ai/resume-screening",
          enabled: ability.can("read", "AI"),
        },
        {
          title: "Sentiment Analysis",
          href: "/dashboard/ai/sentiment",
          enabled: ability.can("read", "AI"),
        },
        {
          title: "Predictive Analytics",
          href: "/dashboard/ai/analytics",
          enabled: ability.can("read", "AI"),
        },
      ],
    },
    {
      title: "Recruitment",
      icon: UserPlus,
      href: "/dashboard/recruitment",
      submenu: [
        {
          title: "Job Postings",
          href: "/dashboard/recruitment/jobs",
        },
        {
          title: "Applications",
          href: "/dashboard/recruitment/applications",
        },
        {
          title: "Interview Schedule",
          href: "/dashboard/recruitment/interviews",
        },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
    },
    {
      title: "Company",
      icon: Building,
      href: "/dashboard/company",
      enabled: ability.can("read", "Company"),
      submenu: [
        {
          title: "Departments",
          href: "/dashboard/company/departments",
        },
        {
          title: "Policies",
          href: "/dashboard/company/policies",
        },
        {
          title: "Announcements",
          href: "/dashboard/company/announcements",
        },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];
  return MENU_ITEMS;
};
