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

interface VerificationEmailTemplateProps {
  inviteLink: string;
  companyName?: string;
}

export const VerificationEmailTemplate = ({
  inviteLink,
  companyName = "Humantryx",
}: VerificationEmailTemplateProps) => {
  const previewText = `Verify your email address for ${companyName} platform.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[900px] rounded border border-solid border-[#eaeaea] p-[40px]">
            <Section className="text-center">
              <Heading className="mx-0 my-[30px] p-0 text-[24px] font-semibold text-[#111827]">
                Welcome to {companyName}
              </Heading>
            </Section>

            <Text className="text-base text-[#374151]">
              Thank you for creating your account with {companyName}! Please
              verify your email address to complete your registration.
            </Text>

            <Section className="text-center">
              <Button
                href={inviteLink}
                className="rounded-lg bg-[#4f46e5] px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Verify Email 
              </Button>
            </Section>

            <Section className="my-[32px] text-center">
              <Text className="text-sm text-[#6b7280]">
                Please click the button above to verify your email address and
                activate your account.
              </Text>
            </Section>

            <Section className="my-[32px] rounded-lg bg-[#f3f4f6] p-[24px]">
              <Text className="m-0 font-semibold text-[#111827]">
                Can&apos;t click the button?
              </Text>
              <Text className="m-2 text-sm text-[#374151]">
                Copy and paste this URL into your browser:
              </Text>
              <Text className="m-4 rounded-md bg-white p-4 font-mono text-sm break-all text-[#111827]">
                {inviteLink}
              </Text>
            </Section>

            <Section className="my-[32px]">
              <Text className="font-semibold text-[#111827]">
                Once verified, you&apos;ll have access to:
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Your personal dashboard and profile
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Secure account management features
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Important notifications and updates
              </Text>
              <Text className="ml-4 text-[#374151]">
                • Full access to {companyName} services
              </Text>
            </Section>

            <Text className="text-base text-[#374151]">
              If you have any questions, please don&apos;t hesitate to contact
              our support team.
            </Text>

            <Hr className="my-[32px] w-full border border-solid border-[#eaeaea]" />

            <Section className="text-center">
              <Text className="text-sm text-[#6b7280]">
                Best regards,
                <br />
                The {companyName} Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerificationEmailTemplate.PreviewProps = {
  inviteLink: "http://localhost:3000/verify-email?token=sample-token",
  companyName: "Humantryx",
};
