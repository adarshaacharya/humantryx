"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, Clock } from "lucide-react";
import { LeaveRequestForm } from "./leave-request-form";
import { LeaveBalanceCard } from "./leave-balance-card";
import { LeaveRequestsTable } from "../manage/leave-requests-table";

export function LeavesPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            Manage your leave requests and view balances
          </p>
        </div>

        <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
          <DialogTrigger asChild>
            <Button>
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
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LeaveBalanceCard />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-muted-foreground text-sm">
                    Total Requests
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-muted-foreground text-sm">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <div className="text-muted-foreground text-sm">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leave Requests */}
      <LeaveRequestsTable showFilters={false} />
    </div>
  );
}
