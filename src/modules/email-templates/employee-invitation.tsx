import type { EmployeeDesignation } from "@/server/db/consts";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface EmployeeInvitationEmailProps {
  email: string;
  organizationName: string;
  invitationId: string;
  invitationLink: string;
}

export const EmployeeInvitationEmail = ({
  email,
  organizationName,
  invitationLink,
  invitationId,
}: EmployeeInvitationEmailProps) => {
  const previewText = `Join ${organizationName}`;

  return (
    <Html>
      <Head>Invitation to Join {organizationName}</Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[900px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="text-center">
              <Heading className="mx-0 my-[30px] p-0 text-[24px] font-semibold text-[#111827]">
                Welcome to {organizationName}
              </Heading>
            </Section>

            <Text className="text-base text-[#374151]">Dear {email},</Text>

            <Text className="text-base text-[#374151]">
              We&apos;re excited to have you join {organizationName}.
            </Text>

            <Section className="text-center">
              <Button
                href={invitationLink}
                className="rounded-lg bg-[#4f46e5] px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Accept Invitation
              </Button>
            </Section>

            <Section className="my-[32px] text-center">
              <Text className="text-sm text-[#6b7280]">
                Please click the button above to accept your invitation and be
                part of our team.
              </Text>
            </Section>

            <Section className="my-[32px] rounded-lg bg-[#f3f4f6] p-[20px] text-center">
              <Text className="m-0 font-semibold text-[#111827]">
                Your Invitation ID
              </Text>
              <Text className="m-4 rounded-md bg-white p-3 font-mono text-lg text-[#111827]">
                {invitationId}
              </Text>
              <Text className="m-0 text-sm text-[#374151]">
                Use this ID to complete your registration
              </Text>
            </Section>

            <Section className="my-[32px]">
              <Text className="font-semibold text-[#111827]">
                As a team member, you&apos;ll have access to:
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Your employee profile and personal information
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Attendance tracking system
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Leave management system
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Organization updates and announcements
              </Text>
            </Section>

            <Text className="text-base text-[#374151]">
              If you have any questions, please don&apos;t hesitate to reach out
              to your HR representative.
            </Text>

            <Hr className="my-[32px] w-full border border-solid border-[#eaeaea]" />

            <Section className="text-center">
              <Text className="text-sm text-[#6b7280]">
                Best regards,
                <br />
                The Humantryx Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EmployeeInvitationEmail.PreviewProps = {
  name: "John Doe",
  organizationName: "Acme Inc",
  designation: "Software Engineer",
  invitationId: "inv_123456789",
  appUrl: "http://localhost:3000",
};
