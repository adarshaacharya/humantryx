"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LeaveRequestForm } from "./leave-request-form";
import { LeaveBalanceCard } from "./leave-balance-card";
import { MyLeaveStatsCard } from "./leave-stats-card";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { LeaveRequestsTable } from "../requests/components/leave-requests-table";
import { AILeaveRequestForm } from "./ai-leave-request-form";

export function LeavesPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const employee = useCurrentEmployee();

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My leaves</h1>
          <p className="text-muted-foreground">
            View your leave balances, request new leaves, and manage your leave
            requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Leave Request</DialogTitle>
              </DialogHeader>
              <LeaveRequestForm
                onSuccess={() => setShowRequestForm(false)}
                onCancel={() => setShowRequestForm(false)}
              />
            </DialogContent>
          </Dialog>

          <AILeaveRequestForm />
        </div>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LeaveBalanceCard employeeId={employee?.id} />
        </div>

        <div className="lg:col-span-2">
          <MyLeaveStatsCard />
        </div>
      </div>

      {/* Leave Requests */}
      <LeaveRequestsTable employeeId={employee?.id} showFilters={false} />
    </div>
  );
}
