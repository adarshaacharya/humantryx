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

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Employees",
    icon: Users,
    href: "/dashboard/employees",
    submenu: [
      {
        title: "All Employees",
        href: "/dashboard/employees",
      },
      {
        title: "Invitations",
        href: "/dashboard/employees/invitations",
      },
    ],
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/dashboard/attendance",
    submenu: [
      {
        title: "Daily Attendance",
        href: "/dashboard/attendance",
      },
      {
        title: "Time Logs",
        href: "/dashboard/attendance/logs",
      },
      {
        title: "Attendance Reports",
        href: "/dashboard/attendance/reports",
      },
    ],
  },
  {
    title: "Leave Management",
    icon: Calendar,
    href: "/dashboard/leave",
    submenu: [
      {
        title: "Leave Requests",
        href: "/dashboard/leave",
      },
      {
        title: "Leave Policies",
        href: "/dashboard/leave/policies",
      },
      {
        title: "Leave Calendar",
        href: "/dashboard/leave/calendar",
      },
    ],
  },
  {
    title: "Payroll",
    icon: DollarSign,
    href: "/dashboard/payroll",
    submenu: [
      {
        title: "Salary Management",
        href: "/dashboard/payroll",
      },
      {
        title: "Payslips",
        href: "/dashboard/payroll/payslips",
      },
      {
        title: "Tax Reports",
        href: "/dashboard/payroll/tax",
      },
    ],
  },
  {
    title: "AI Features",
    icon: Sparkles,
    href: "/dashboard/ai",
    submenu: [
      {
        title: "Resume Screening",
        href: "/dashboard/ai/resume-screening",
      },
      {
        title: "Sentiment Analysis",
        href: "/dashboard/ai/sentiment",
      },
      {
        title: "Predictive Analytics",
        href: "/dashboard/ai/analytics",
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
