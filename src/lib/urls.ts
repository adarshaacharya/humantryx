/**
 * Generate a shareable URL for a job posting
 */
export function generateJobShareableUrl(
  organizationId: string,
  jobId: string,
): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  return `${baseUrl}/jobs/${organizationId}/${jobId}`;
}
