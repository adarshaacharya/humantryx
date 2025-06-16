import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type NewsArticle = RouterOutputs["news"]["getNews"][0];
export type NewsWithAuthor = NewsArticle;
