import {
  DollarSign,
  Calculator,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export const PAYMENT_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    variant: "outline" as const,
    icon: AlertCircle,
    color: "text-yellow-600 border-yellow-500",
  },
  {
    value: "paid",
    label: "Paid",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-green-600 border-green-500",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-red-600 border-red-500",
  },
] as const;

export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

export const CURRENT_YEAR = 2025;
export const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

export const PAYROLL_FEATURES = [
  {
    title: "Salary Management",
    description: "Set up and manage employee salaries and tax settings",
    icon: DollarSign,
    href: "/dashboard/payroll",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Payroll Generation",
    description: "Generate monthly payroll with automated calculations",
    icon: Calculator,
    href: "/dashboard/payroll/generate",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Payslips",
    description: "View and download employee payslips",
    icon: Receipt,
    href: "/dashboard/payroll/payslips",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Payment Tracking",
    description: "Track payment status and manage payment records",
    icon: CreditCard,
    href: "/dashboard/payroll/payments",
    color: "from-orange-500 to-red-500",
  },
] as const;

export const getPaymentStatusBadge = (status: string) => {
  const statusConfig = PAYMENT_STATUSES.find((s) => s.value === status);
  return statusConfig || PAYMENT_STATUSES[0];
};
