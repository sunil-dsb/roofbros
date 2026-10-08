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
import { revokeAppleAccount, exchangeAppleAuthorizationCode } from './apple.ts';

// Generate the client secret JWT required for 'Sign in with Apple'.
export async function generateAppleClientSecret(
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
  account: {
    updateAccountOnSignIn: true,
  },
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
      deletionRequestedAt: {
        type: 'date',
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    additionalFields: {
      isRestored: {
        type: 'boolean',
        required: false,
      },
      restoreMessage: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    account: {
      create: {
        before: async (account) => {
          if (
            account.providerId === 'apple' &&
            !account.refreshToken &&
            account.accessToken
          ) {
            try {
              const clientSecret = await generateAppleClientSecret(
                config.appleClientId,
                config.appleTeamId,
                config.appleKeyId,
                config.applePrivateKey,
              );
              const tokens = await exchangeAppleAuthorizationCode(
                config.appleClientId,
                clientSecret,
                account.accessToken,
              );
              if (tokens?.refreshToken) {
                logger.info(
                  'Auto-exchanged Apple authorization code for refresh token',
                );
                return {
                  data: {
                    ...account,
                    refreshToken: tokens.refreshToken,
                    accessToken: tokens.accessToken || account.accessToken,
                  },
                };
              }
            } catch (err) {
              logger.warn(
                'Failed auto-exchanging Apple authorization code in hook',
                {
                  error: err,
                },
              );
            }
          }
          return { data: account };
        },
        after: async (account) => {
          if (account.providerId) {
            await db
              .update(schema.user)
              .set({ authProvider: account.providerId })
              .where(eq(schema.user.id, account.userId));
          }
        },
      },
      update: {
        after: async (account) => {
          if (account.providerId) {
            await db
              .update(schema.user)
              .set({ authProvider: account.providerId })
              .where(eq(schema.user.id, account.userId));
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const userRecord = await db.query.user.findFirst({
            where: eq(schema.user.id, session.userId),
          });

          if (userRecord?.deletionRequestedAt) {
            const GRACE_PERIOD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days (for testing)
            const elapsed =
              Date.now() - new Date(userRecord.deletionRequestedAt).getTime();

            if (elapsed < GRACE_PERIOD_MS) {
              // Within window → restore the account
              await db
                .update(schema.user)
                .set({ deletionRequestedAt: null })
                .where(eq(schema.user.id, userRecord.id));

              // Tell the frontend by setting the flag on the session
              return {
                data: {
                  ...session,
                  isRestored: true,
                  restoreMessage:
                    'Welcome back! Your account deletion was cancelled.',
                },
              };
            }

            // Window expired -> Hard delete
            // 1. Fetch OAuth accounts to see if we need to revoke Apple token
            const accounts = await db.query.account.findMany({
              where: eq(schema.account.userId, userRecord.id),
            });
            const appleAccount = accounts.find((a) => a.providerId === 'apple');
            if (appleAccount) {
              await revokeAppleAccount(appleAccount);
            }

            // 2. Hard delete the user (cascades to accounts and sessions)
            await db
              .delete(schema.user)
              .where(eq(schema.user.id, userRecord.id));

            // 3. Reject login attempt
            throw new ApiError(
              'ACCOUNT_PERMANENTLY_DELETED',
              httpStatus.BAD_REQUEST,
              true,
            );
          }
          return { data: session };
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
      mapProfileToUser: (profile) => {
        return {
          ...(profile.name ? { name: profile.name } : {}),
        };
      },
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
