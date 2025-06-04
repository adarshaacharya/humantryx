import { Crown, Shield, User } from "lucide-react";

export const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "owner":
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case "admin":
      return <Shield className="h-4 w-4 text-blue-500" />;
    default:
      return <User className="h-4 w-4 text-gray-500" />;
  }
};

export const getRoleBadgeVariant = (
  role: string,
): "default" | "secondary" | "outline" => {
  switch (role.toLowerCase()) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
};
