// the auth file should be here !!!
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { cache } from "react";
import { headers } from "next/headers";
import { db } from "../db";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";
import {
  sendChangeEmailVerification,
  sendVerificationEmail,
} from "@/server/auth/email";
import { env } from "@/env";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ url }) {
      console.log("Reset password URL:", url);
    },
  },
  plugins: [
    nextCookies(),
    admin({
      adminRoles: ["super_admin"],
      defaultRole: "user",
    }),
    organization({
      
    }),
  ],
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }, _request) => {
        const { error } = await sendChangeEmailVerification({
          email: newEmail,
          verificationUrl: url,
        });

        if (error)
          return console.log("sendChangeEmailVerification Error: ", error);
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 1, // 1 HOUR
    autoSignInAfterVerification: false, // Don't auto sign in after verification
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      const { error } = await sendVerificationEmail({
        email: user.email,
        verificationUrl: verificationUrl,
      });

      if (error) return console.log("sendVerificationEmail Error: ", error);
    },
  },

  socialProviders: {},
});

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export type Session = typeof auth.$Infer.Session;
export type AuthUserType = Session["user"];
