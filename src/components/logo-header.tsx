import { Brain } from "lucide-react";
import Link from "next/link";

export function LogoHeader() {
  return (
    <Link href="/" className="mb-8 inline-flex items-center">
      <div className="relative">
        <Brain className="text-primary h-8 w-8" />
        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400" />
      </div>
      <span className="text-foreground ml-2 text-xl font-bold">Human Loop</span>
    </Link>
  );
}
