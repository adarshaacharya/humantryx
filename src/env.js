import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1, {
      message: "BETTER_AUTH_SECRET must be set",
    }),
    BETTER_AUTH_URL: z.string().url(),
    RESEND_API_KEY: z.string().min(1, {
      message: "RESEND_API_KEY must be set",
    }),
    EMAIL_FROM: z.string().email({
      message: "EMAIL_FROM must be a valid email address",
    }),
    EMAIL_VERIFICATION_CALLBACK_URL: z
      .string()
      .url()
      .default("http://localhost:3000/api/auth/callback/email-verification"),
    ORGANIZATION_INVITATION_CALLBACK_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    R2_ACCESS_KEY_ID: z.string().min(1, {
      message: "R2_ACCESS_KEY_ID must be set",
    }),
    R2_SECRET_ACCESS_KEY: z.string().min(1, {
      message: "R2_SECRET_ACCESS_KEY must be set",
    }),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, {
      message: "UPSTASH_REDIS_REST_TOKEN must be set",
    }),
    GROQ_API_KEY: z.string().min(1, {
      message: "GROQ_API_KEY must be set",
    }),
    PINECONE_API_KEY: z.string().min(1, {
      message: "PINECONE_API_KEY must be set",
    }),
    PINECONE_INDEX: z.string().min(1, {
      message: "PINECONE_INDEX must be set",
    }),
    OPENAI_API_KEY: z.string().min(1, {
      message: "OPENAI_API_KEY must be set",
    }),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_R2_ENDPOINT_URL: z.string().url(),
    NEXT_PUBLIC_R2_BUCKET_NAME: z.string().min(1, {
      message: "R2_BUCKET_NAME must be set",
    }),
    NEXT_PUBLIC_R2_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_C15T_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_VERIFICATION_CALLBACK_URL:
      process.env.EMAIL_VERIFICATION_CALLBACK_URL,
    ORGANIZATION_INVITATION_CALLBACK_URL:
      process.env.ORGANIZATION_INVITATION_CALLBACK_URL,
    NEXT_PUBLIC_R2_ENDPOINT_URL: process.env.NEXT_PUBLIC_R2_ENDPOINT_URL,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_R2_BUCKET_NAME: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX: process.env.PINECONE_INDEX,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_C15T_URL: process.env.NEXT_PUBLIC_C15T_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
