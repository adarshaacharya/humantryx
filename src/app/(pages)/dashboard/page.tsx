import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PersonalDetails } from "@/modules/dashboard/personal-details";
import { DashboardStats } from "@/modules/dashboard/dashboard-stats";
import { QuickActions } from "@/modules/dashboard/quick-actions";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <PersonalDetails />

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <QuickActions />
    </div>
  );
}
