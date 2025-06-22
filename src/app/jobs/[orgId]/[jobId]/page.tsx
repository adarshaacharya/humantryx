import { JobDetailWithTabs } from "@/modules/recruitment/postings/listing/job-detail-with-tabs";

interface JobDetailPageProps {
  params: Promise<{
    orgId: string;
    jobId: string;
  }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { orgId, jobId } = await params;

  return <JobDetailWithTabs organizationId={orgId} jobId={jobId} isPublic />;
}
