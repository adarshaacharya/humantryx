/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-fac9e1aa030246c6b405a6e33e17233e.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/c15t/:path*",
        destination: `${env.NEXT_PUBLIC_C15T_URL}/:path*`,
      },
    ];
  },
};

export default config;
