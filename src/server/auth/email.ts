import { env } from "@/env";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { VerificationEmailTemplate } from "@/modules/email-templates/email-verification";
import { ResetPasswordEmailTemplate } from "@/modules/email-templates/reset-password-email";
import { ChangeEmailVerificationTemplate } from "@/modules/email-templates/change-email-verification";
import { EmployeeInvitationEmail } from "@/modules/email-templates/employee-invitation";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Verify your Email address",
    html: await render(
      VerificationEmailTemplate({ inviteLink: verificationUrl }),
    ),
  });
};

export const sendResetPasswordEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Reset Password Link",
    react: ResetPasswordEmailTemplate({ inviteLink: verificationUrl }),
  });
};

export const sendChangeEmailVerification = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Reset Password Link",
    react: ChangeEmailVerificationTemplate({ inviteLink: verificationUrl }),
  });
};

export const sendOrganizationInvitationEmail = async ({
  email,
  inviteLink,
  orgName,
  inviteId,
}: {
  email: string;
  inviteLink: string;
  orgName: string;
  inviteId?: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Organization Invitation",
    react: EmployeeInvitationEmail({
      invitationLink: inviteLink,
      organizationName: orgName,
      email,
      invitationId: inviteId ?? "N/A",
    }),
  });
};
