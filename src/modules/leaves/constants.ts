export const LEAVE_TYPES = [
  {
    value: "annual",
    label: "Annual Leave",
    icon: "🏖️",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "sick",
    label: "Sick Leave",
    icon: "🤒",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "casual",
    label: "Casual Leave",
    icon: "🌤️",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "maternity",
    label: "Maternity Leave",
    icon: "👶",
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "paternity",
    label: "Paternity Leave",
    icon: "👨‍👶",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "emergency",
    label: "Emergency Leave",
    icon: "🚨",
    color: "bg-orange-100 text-orange-800",
  },
] as const;

export const LEAVE_STATUSES = {
  pending: {
    label: "Pending",
    icon: "⏳",
    color: "bg-yellow-100 text-yellow-800",
  },
  approved: {
    label: "Approved",
    icon: "✅",
    color: "bg-green-100 text-green-800",
  },
  rejected: { label: "Rejected", icon: "❌", color: "bg-red-100 text-red-800" },
  cancelled: {
    label: "Cancelled",
    icon: "🚫",
    color: "bg-gray-100 text-gray-800",
  },
} as const;

export type LeaveType = (typeof LEAVE_TYPES)[number]["value"];
export type LeaveStatus = keyof typeof LEAVE_STATUSES;
