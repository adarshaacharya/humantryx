import { Suspense } from "react";
import { JobsHeader } from "@/modules/recruitment/components/jobs-header";
import { JobsList } from "@/modules/recruitment/postings/listing/jobs-list";
import { JobsStats } from "@/modules/recruitment/components/jobs-stats";
import {
  JobsLoadingSkeleton,
  StatsLoadingSkeleton,
} from "@/modules/recruitment/components/skeletons";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <JobsHeader />

      <Suspense fallback={<StatsLoadingSkeleton />}>
        <JobsStats />
      </Suspense>

      <Suspense fallback={<JobsLoadingSkeleton />}>
        <JobsList />
      </Suspense>
    </div>
  );
}
