"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

type TeamOverviewCardProps = {
  organizationName: string;
  memberCount: number;
};

export function TeamOverviewCard({
  organizationName,
  memberCount,
}: TeamOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Team Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Welcome to {organizationName}
          </h3>
          <p className="text-sm text-gray-600">
            You're part of a team with {memberCount} member
            {memberCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <span className="text-sm font-medium text-gray-900">Team Size</span>
            <span className="text-lg font-semibold text-gray-900">
              {memberCount}
            </span>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start space-x-2">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xs font-medium text-blue-600">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Quick Tip</p>
                <p className="text-xs text-blue-700">
                  Contact your HR manager or admin if you need access to
                  additional features or have questions about your role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
