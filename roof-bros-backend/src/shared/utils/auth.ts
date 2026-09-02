import { betterAuth } from 'better-auth';
import { emailOTP, bearer } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../../config/db.ts';
import * as schema from '../../db/schema/index.ts';
import config from '../../config/index.ts';
import { resend } from './ResendClient.ts';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../validations/auth.validation.ts';
import { importPKCS8, SignJWT } from 'jose';
import { eq } from 'drizzle-orm';
import { logger } from '../../config/logger.ts';
import ApiError from './ApiError.ts';
import httpStatus from 'http-status';
import { getAuthEmailTemplate } from './emailTemplates.ts';

// Generate the client secret JWT required for 'Sign in with Apple'.
async function generateAppleClientSecret(
  clientId: string,
  teamId: string,
  keyId: string,
  privateKey: string,
) {
  const key = await importPKCS8(privateKey, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
}

const isProduction = config.env === 'production';

export const auth = betterAuth({
  appName: 'Roof Bros',
  baseURL: config.betterAuthUrl,
  secret: config.betterAuthSecret,
  /**
   * better-auth serves its own router here (see src/app.ts). Our hand-written
   * v1 controllers live under /api/v1/auth, so the two never shadow each other.
   */
  basePath: '/api/auth',
  /** CSRF/redirect allow-list — same list the CORS layer trusts, plus the
   *  server's own URL so server-to-server auth.api calls pass CSRF check. */
  trustedOrigins: [...config.cors, config.betterAuthUrl, 'roofbros://'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  user: {
    additionalFields: {
      authProvider: {
        type: 'string',
        required: false,
      },
      isBusiness: {
        type: 'boolean',
        required: false,
      },
      abn: {
        type: 'string',
        required: false,
      },
      businessName: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          await db
            .update(schema.user)
            .set({ authProvider: account.providerId })
            .where(eq(schema.user.id, account.userId));
        },
      },
      update: {
        after: async (account) => {
          await db
            .update(schema.user)
            .set({ authProvider: account.providerId })
            .where(eq(schema.user.id, account.userId));
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    autoSignIn: true,
    // emailOTP's sendVerificationOTP only needs the CSRF Origin header — NOT a
    // session — so this can safely be true without blocking the /otp/send flow.
    requireEmailVerification: true,
    preventUserEnumeration: false,
  },
  plugins: [
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === 'sign-in'
            ? 'Your sign-in code'
            : type === 'email-verification'
              ? 'Your security verification code'
              : 'Reset your password';

        const title =
          type === 'sign-in'
            ? 'Sign in to your account.'
            : type === 'email-verification'
              ? 'Verify your email.'
              : 'Reset your password.';

        const bodyText =
          type === 'sign-in'
            ? `We sent a six-digit code to <strong style="color:#333333;">${email}</strong>. Enter it to sign in to your RoofBros account.`
            : type === 'email-verification'
              ? `We sent a six-digit code to <strong style="color:#333333;">${email}</strong>. Enter it to confirm your address it's how you'll sign in to RoofBros.`
              : `We sent a six-digit code to <strong style="color:#333333;">${email}</strong>. Enter it to securely reset your RoofBros password.`;

        const { data, error } = await resend.emails.send({
          from: 'RoofBros <noreply@mosaiceffect.in>',
          to: email,
          subject,
          html: getAuthEmailTemplate(title, bodyText, otp),
        });

        if (error) {
          logger.error('Failed to send OTP email', { resendError: error });
          throw new ApiError(
            'Failed to send verification email. Please try again.',
            httpStatus.SERVICE_UNAVAILABLE,
            true,
          );
        } else {
          logger.info(`OTP email sent successfully to emailId: ${data?.id}`);
        }
      },
      expiresIn: 300,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    // disableOriginCheck: true,
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    },
  },
  /**
   * Second line of defence behind the express-rate-limit middleware: this one
   * also covers the routes better-auth serves directly (verification, reset).
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
  },
  socialProviders: {
    apple: async () => ({
      clientId: config.appleClientId,
      clientSecret: await generateAppleClientSecret(
        config.appleClientId,
        config.appleTeamId,
        config.appleKeyId,
        config.applePrivateKey,
      ),
    }),
    google: {
      clientId: [
        process.env.GOOGLE_WEB_CLIENT_ID as string,
        process.env.GOOGLE_IOS_CLIENT_ID as string,
        process.env.GOOGLE_ANDROID_CLIENT_ID as string,
      ],
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // advanced: {
  //   disableOriginCheck: true,
  // },
});

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
