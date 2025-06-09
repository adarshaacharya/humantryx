import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, MessageSquare, Rocket } from "lucide-react";
import { authClient, useSession } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UpsertUserForm } from "@/modules/users/upsert-user-form";
import * as React from "react";

export function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
            toast.success("Signed out successfully");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="border-border hover:bg-accent hover:text-accent-foreground relative h-8 w-8 rounded-full border shadow-sm"
        >
          <div className="flex h-full w-full items-center justify-center">
            {session?.user.image ? (
              <Avatar>
                <AvatarImage src={session.user.image} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) ?? "-"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <span className="border-background absolute right-0 bottom-0 h-2 w-2 rounded-full border bg-green-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {session?.user.name ?? "-"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session?.user.email ?? "-"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <Rocket className="mr-2 h-4 w-4" />
          <span>Go to Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Profile Update Dialog */}
      <UpsertUserForm
        isOpen={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </DropdownMenu>
  );
}
