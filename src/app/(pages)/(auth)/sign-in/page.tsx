import { SignInForm } from "@/modules/auth/sign-in-form";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
          <div className="bg-accent mx-auto flex h-120 w-120 animate-pulse items-center justify-center rounded-md text-sm">
            Loading sign-in form...
          </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
