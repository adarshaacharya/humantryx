import { OrganizationSetupForm } from "@/modules/auth/organization-setup-form";
import { Suspense } from "react";

export default function OrganizationSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrganizationSetupForm />
    </Suspense>
  );
}
