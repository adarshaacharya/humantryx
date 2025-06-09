/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

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
};

export default config;
