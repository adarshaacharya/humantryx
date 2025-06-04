import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  DollarSign,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
} from "lucide-react";
import { OrganizationOverview } from "@/modules/dashboard/organization-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <OrganizationOverview />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-muted-foreground text-xs">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-muted-foreground text-xs">
              95.5% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <UserX className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11</div>
            <p className="text-muted-foreground text-xs">4.5% of workforce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Payroll
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$458,230</div>
            <p className="text-muted-foreground text-xs">
              +3.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from your HR system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none font-medium">
                  John Doe submitted a leave request
                </p>
                <p className="text-muted-foreground text-sm">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none font-medium">
                  Payroll processing completed
                </p>
                <p className="text-muted-foreground text-sm">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none font-medium">
                  New employee onboarding started
                </p>
                <p className="text-muted-foreground text-sm">3 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-2 w-2 rounded-full bg-purple-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-none font-medium">
                  AI sentiment analysis completed
                </p>
                <p className="text-muted-foreground text-sm">5 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="text-primary h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>
              AI-powered analytics and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Employee Satisfaction
                </span>
                <Badge variant="secondary">87%</Badge>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div className="h-2 w-[87%] rounded-full bg-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Turnover Risk</span>
                <Badge variant="outline">Low</Badge>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div className="h-2 w-[25%] rounded-full bg-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Productivity Score</span>
                <Badge variant="secondary">92%</Badge>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div className="h-2 w-[92%] rounded-full bg-blue-500" />
              </div>
            </div>

            <div className="bg-primary/5 mt-4 rounded-lg p-3">
              <p className="text-primary text-sm">
                💡 <strong>AI Recommendation:</strong> Consider implementing
                flexible work hours to further boost employee satisfaction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used HR management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-3">
              <Users className="text-primary h-8 w-8" />
              <div>
                <p className="font-medium">Add Employee</p>
                <p className="text-muted-foreground text-sm">
                  Onboard new team member
                </p>
              </div>
            </div>

            <div className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-3">
              <Clock className="text-primary h-8 w-8" />
              <div>
                <p className="font-medium">Mark Attendance</p>
                <p className="text-muted-foreground text-sm">
                  Record daily attendance
                </p>
              </div>
            </div>

            <div className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-3">
              <Calendar className="text-primary h-8 w-8" />
              <div>
                <p className="font-medium">Approve Leaves</p>
                <p className="text-muted-foreground text-sm">
                  Review pending requests
                </p>
              </div>
            </div>

            <div className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-3">
              <DollarSign className="text-primary h-8 w-8" />
              <div>
                <p className="font-medium">Process Payroll</p>
                <p className="text-muted-foreground text-sm">
                  Generate monthly payroll
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
