import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Users,
  Settings,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function LeavesIndexPage() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Leave Management System
        </h1>
        <p className="text-muted-foreground">
          Access all leave-related features from here
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Review and manage employee leave requests. Approve or reject
              pending applications.
            </p>
            <Link href="/dashboard/leaves/requests">
              <Button className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Manage Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Leave Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Monitor employee leave balances and adjust allocations as needed.
            </p>
            <Link href="/dashboard/leaves/manage">
              <Button className="w-full" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Balances
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Leave Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Configure leave policies, types, and organization-wide settings.
            </p>
            <Link href="/dashboard/leaves/policies">
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Policies
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="bg-muted/50 mt-8 rounded-lg p-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Access</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">📋</div>
            <p className="text-sm font-medium">Requests</p>
            <p className="text-muted-foreground text-xs">View and manage</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">⚖️</div>
            <p className="text-sm font-medium">Balances</p>
            <p className="text-muted-foreground text-xs">Track allocations</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">⚙️</div>
            <p className="text-sm font-medium">Policies</p>
            <p className="text-muted-foreground text-xs">Configure rules</p>
          </div>
        </div>
      </div>
    </div>
  );
}
