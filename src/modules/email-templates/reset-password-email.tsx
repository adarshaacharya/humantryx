import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailTemplateProps {
  inviteLink: string;
}

export const ResetPasswordEmailTemplate = ({
  inviteLink,
}: ResetPasswordEmailTemplateProps) => {
  const previewText = `Reset Your Password - Humantryx HRMS`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[900px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              <strong>Reset Your Password</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              We received a request to reset your password for your Humantryx
              account. Click the button below to create a new password.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded-lg bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              Or copy and paste this URL into your browser:{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Text className="text-[12px] leading-[20px] text-gray-500">
              If you didn&apos;t request a password reset, please ignore this
              email. This link will expire in 1 hour for security purposes.
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ResetPasswordEmailTemplate.PreviewProps = {
  inviteLink: "http://localhost:3000",
};
