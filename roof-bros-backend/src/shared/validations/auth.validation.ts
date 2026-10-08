import { z } from 'zod';

/**
 * Kept in sync with the `emailAndPassword` block in src/shared/utils/auth.ts.
 * better-auth re-checks the password length itself, so a mismatch here would
 * surface as a confusing second-stage rejection instead of a field error.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** RFC 5321 caps an address at 254 characters. */
const EMAIL_MAX_LENGTH = 254;
const URL_MAX_LENGTH = 2048;

const emailField = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX_LENGTH, `Email must not exceed ${EMAIL_MAX_LENGTH} characters`)
  .pipe(z.email('Please provide a valid email address'));

/**
 * Only enforced on sign up. Sign in deliberately skips the complexity rules so
 * we neither lock out accounts created under an older policy nor advertise the
 * policy to someone guessing credentials.
 */
const newPasswordField = z
  .string({ error: 'Password is required' })
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
  )
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character',
  );

/**
 * Bounded but otherwise unvalidated: the only job here is to stop an unbounded
 * string from reaching the password hasher.
 */
const existingPasswordField = z
  .string({ error: 'Password is required' })
  .min(1, 'Password is required')
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
  );

const nameField = z
  .string({ error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}'\-. ]*$/u,
    'Name may only contain letters, spaces, apostrophes, hyphens and periods',
  );

/**
 * Relative paths only. better-auth echoes `callbackURL` back as a redirect, so
 * accepting an absolute URL would turn sign in/sign up into an open redirect.
 * `//evil.com` is protocol-relative and therefore rejected as well.
 */
const callbackURLField = z
  .string()
  .trim()
  .min(1, 'callbackURL must not be empty')
  .max(
    URL_MAX_LENGTH,
    `callbackURL must not exceed ${URL_MAX_LENGTH} characters`,
  )
  .refine(
    (value) => value.startsWith('/') && !value.startsWith('//'),
    'callbackURL must be a relative path such as "/dashboard"',
  );

const imageField = z
  .string()
  .trim()
  .max(URL_MAX_LENGTH, `Image URL must not exceed ${URL_MAX_LENGTH} characters`)
  .pipe(z.url('Image must be a valid URL'))
  .refine((value) => value.startsWith('https://'), 'Image URL must use https');

/**
 * `strictObject` rejects unknown keys, which blocks mass assignment — the
 * better-auth sign-up body schema otherwise forwards arbitrary extra fields
 * onto the user record.
 */
export const signUpSchema = z.strictObject({
  name: nameField,
  email: emailField,
  password: newPasswordField,
  image: imageField.optional(),
  rememberMe: z.boolean().optional(),
  callbackURL: callbackURLField.optional(),
});

export const signInSchema = z.strictObject({
  email: emailField,
  password: existingPasswordField,
  rememberMe: z.boolean().optional(),
  callbackURL: callbackURLField.optional(),
});

export const sendOtpSchema = z.strictObject({
  email: emailField,
});

export const verifyEmailOtpSchema = z.strictObject({
  email: emailField,
  otp: z.string().min(1, 'OTP is required'),
});

export const forgetPasswordSchema = z.strictObject({
  email: emailField,
});

export const verifyForgetPasswordOtpSchema = z.strictObject({
  email: emailField,
  otp: z.string().min(1, 'OTP is required'),
});

export const resetPasswordSchema = z.strictObject({
  otp: z.string().min(1, 'OTP is required'),
  email: emailField,
  password: newPasswordField,
});

export const changePasswordSchema = z.strictObject({
  currentPassword: existingPasswordField,
  newPassword: newPasswordField,
});

export const updateBusinessSchema = z.strictObject({
  abn: z
    .string()
    .min(1, 'ABN is required')
    .max(100, 'ABN must not exceed 100 characters'),
  businessName: z
    .string()
    .min(1, 'Business name is required')
    .max(200, 'Business name must not exceed 200 characters'),
});

/**
 * Validates the :abn URL param — must be exactly 11 numeric digits
 * (Australian Business Number format) so invalid strings never reach the
 * external ABR API.
 */
export const businessDetailsParamsSchema = z.object({
  abn: z
    .string()
    .regex(
      /^\d{11}$/,
      'ABN must be exactly 11 digits with no spaces or letters',
    ),
});

export const deleteAccountSchema = z.strictObject({
  password: existingPasswordField.or(z.literal('')).optional(),
});

export const storeAppleTokenSchema = z
  .strictObject({
    authorizationCode: z.string().optional(),
    refreshToken: z.string().optional(),
    accessToken: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(data.authorizationCode || data.refreshToken || data.accessToken),
    {
      message:
        'At least one of authorizationCode, refreshToken, or accessToken must be provided',
    },
  );

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyEmailOtpInput = z.infer<typeof verifyEmailOtpSchema>;
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>;
export type VerifyForgetPasswordOtpInput = z.infer<
  typeof verifyForgetPasswordOtpSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type BusinessDetailsParams = z.infer<typeof businessDetailsParamsSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type StoreAppleTokenInput = z.infer<typeof storeAppleTokenSchema>;
