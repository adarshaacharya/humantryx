import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { getSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  return <HydrateClient>Hello world</HydrateClient>;
}
