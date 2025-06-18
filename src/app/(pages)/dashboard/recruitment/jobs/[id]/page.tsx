import { JobDetailWithTabs } from "@/modules/recruitment/postings/listing/job-detail-with-tabs";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const jobId = (await params).id;

  return <JobDetailWithTabs jobId={jobId} />;
}
