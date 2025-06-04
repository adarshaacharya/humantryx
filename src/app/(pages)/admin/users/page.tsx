import { UsersTable } from "@/modules/superadmin/users/users-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/modules/superadmin/components/page-header";

export default function Users() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage users across all organizations"
        action={<Button>Add User</Button>}
      />
      <UsersTable />
    </div>
  );
}
