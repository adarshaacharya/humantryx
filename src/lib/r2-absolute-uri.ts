import { env } from "@/env";

export const getFileAbsoluteURI = (path?: string | null) => {
  if (!path) {
    return "";
  }

  if (path?.startsWith("https:")) {
    return path;
  }

  return `${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${path}`;
};
