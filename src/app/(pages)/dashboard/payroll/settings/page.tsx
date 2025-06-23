import { SalarySettingsManagement } from "@/modules/payroll/components/salary-settings-management";

export default function PayrollSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll Settings</h1>
        <p className="text-muted-foreground">
          Configure salary settings for employees and manage payroll
          preferences.
        </p>
      </div>

      <SalarySettingsManagement />
    </div>
  );
}
