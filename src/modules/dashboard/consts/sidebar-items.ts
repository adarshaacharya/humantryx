import type { AppAbility } from "@/lib/casl/types";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Building,
  Newspaper,
  Briefcase,
  FileText,
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
      title: "News",
      icon: Newspaper,
      href: "/dashboard/news",
      enabled: true,
    },
    {
      title: "Employees",
      icon: Users,
      href: "/dashboard/employees",
      enabled: ability.can("read", "Employee"),
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
      title: "Recruitment",
      icon: Briefcase,
      href: "/dashboard/recruitment/jobs",
      enabled: ability.can("manage", "Recruitment"), // HR and admins can access recruitment
      submenu: [
        {
          title: "Job Postings",
          href: "/dashboard/recruitment/jobs",
          enabled: ability.can("manage", "Recruitment"),
        },
        {
          title: "Applications",
          href: "/dashboard/recruitment/applications",
          enabled: ability.can("manage", "Recruitment"),
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
          title: "Salaries Information",
          href: "/dashboard/payroll/settings",
          enabled: ability.can("manage", "Payroll"),
        },
        {
          title: "My Payslips",
          href: "/dashboard/payroll/payslips",
          enabled: ability.can("read", "Payroll"),
        },
      ],
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
      enabled: ability.can("read", "Documents"),
    },

    {
      title: "Company",
      icon: Building,
      href: "/dashboard/company",
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
  ];
  return MENU_ITEMS;
};
