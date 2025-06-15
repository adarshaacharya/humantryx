"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { Target, TrendingUp, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

type PersonalWorkspaceProps = {
  organizationName: string;
  memberCount: number;
};

export function TeamOverviewCard({
  organizationName,
  memberCount,
}: PersonalWorkspaceProps) {
  const employee = useCurrentEmployee();

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to make today productive?";
    if (hour < 17) return "Good afternoon! Keep up the great work!";
    return "Good evening! Time to wrap up the day strong!";
  };

  const getEmployeeInsights = () => {
    if (!employee) return null;

    const joinedMonthsAgo = employee.createdAt
      ? Math.floor(
          (Date.now() - new Date(employee.createdAt).getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        )
      : 0;

    return {
      joinedMonthsAgo,
      isNewEmployee: joinedMonthsAgo < 3,
      tenureCategory:
        joinedMonthsAgo < 6
          ? "New Joiner"
          : joinedMonthsAgo < 12
            ? "Growing"
            : "Experienced",
    };
  };

  const insights = getEmployeeInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Your Workspace</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Welcome Message */}
        <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg">👋</span>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {getMotivationalMessage()}
            </h3>
            <p className="text-sm text-gray-600">
              You&apos;re contributing to {organizationName}&apos;s success
            </p>
          </div>
        </div>

        {/* Employee Journey & Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{memberCount}</div>
            <div className="text-xs font-medium text-gray-600">Team Size</div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center">
            <div className="text-xl font-bold text-purple-600">
              {insights?.joinedMonthsAgo || 0}
            </div>
            <div className="text-xs font-medium text-gray-600">Months Here</div>
          </div>
        </div>

        {/* Employee Status & Recognition */}
        {insights && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Journey:</span>
              <Badge
                variant="outline"
                className={`text-xs ${
                  insights.isNewEmployee
                    ? "border-blue-200 bg-blue-100 text-blue-800"
                    : "border-green-200 bg-green-100 text-green-800"
                }`}
              >
                <Award className="mr-1 h-3 w-3" />
                {insights.tenureCategory}
              </Badge>
            </div>

            {employee?.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Joined on:</span>
                <div className="flex items-center space-x-1 text-sm text-gray-800">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(employee.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Personalized Quick Actions */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start space-x-2">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-amber-900">
                Today&apos;s Focus
              </p>
              <p className="text-xs leading-relaxed text-amber-700">
                {insights?.isNewEmployee
                  ? "Welcome aboard! Take your time to explore the dashboard and don't hesitate to ask questions."
                  : "Check your attendance, review any pending tasks, and stay connected with your team."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
