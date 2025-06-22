import { SignUpForm } from "@/modules/auth/sign-up-form";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-accent mx-auto flex h-120 w-120 animate-pulse items-center justify-center rounded-md text-sm">
          Loading sign-up form...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
