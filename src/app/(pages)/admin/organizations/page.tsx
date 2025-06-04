import { OrganizationsTable } from "@/modules/superadmin/organizations/organizations-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/modules/superadmin/components/page-header";

export default function Organizations() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Manage organizations in your system"
        action={<Button>Add Organization</Button>}
      />
      <OrganizationsTable />
    </div>
  );
}
