import { PageHeader } from "@/modules/superadmin/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage system-wide settings" />

      <div className="grid gap-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure global system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                placeholder="Humantryx"
                defaultValue="Humantryx"
              />
            </div>

            <div className="space-y-2">
              <Label>User Registration</Label>
              <RadioGroup defaultValue="open">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="open" id="registration-open" />
                  <Label htmlFor="registration-open">Open Registration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite" id="registration-invite" />
                  <Label htmlFor="registration-invite">Invite Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="closed" id="registration-closed" />
                  <Label htmlFor="registration-closed">Closed</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                placeholder="noreply@example.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.example.com" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-auth">Authentication</Label>
                <RadioGroup defaultValue="tls">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tls" id="auth-tls" />
                    <Label htmlFor="auth-tls">TLS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ssl" id="auth-ssl" />
                    <Label htmlFor="auth-ssl">SSL</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input id="smtp-username" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input id="smtp-password" type="password" />
            </div>

            <div className="flex justify-end">
              <div className="space-x-2">
                <Button variant="outline">Test Connection</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
