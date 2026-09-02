import { isAPIError } from 'better-auth/api';
import httpStatus from 'http-status';
import { auth, type AuthSession } from '../../shared/utils/auth.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import config from '../../config/index.ts';
import { db } from '../../config/db.ts';
import { sql, eq } from 'drizzle-orm';
import { user, session } from '../../db/schema/auth.schema.ts';
import crypto from 'node:crypto';
import type {
  SignInInput,
  SignUpInput,
  SendOtpInput,
  VerifyEmailOtpInput,
  ForgetPasswordInput,
  ResetPasswordInput,
  VerifyForgetPasswordOtpInput,
  ChangePasswordInput,
  UpdateBusinessInput,
  DeleteAccountInput,
} from '../../shared/validations/auth.validation.ts';

/**
 * better-auth sets the session cookie on the Headers it returns; the caller
 * is responsible for copying those onto the express response.
 */
export interface AuthResult<T> {
  data: T;
  headers: Headers;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  isBusiness?: boolean | null | undefined;
  abn?: string | null | undefined;
  businessName?: string | null | undefined;
  authProvider?: string | null | undefined;
}

export interface SignUpResponse {
  token: string | null;
  user: AuthUser;
}

export type SignInResponse = SignUpResponse;

export interface OtpResponse {
  success: boolean;
}

export interface VerifyEmailResponse {
  status?: boolean;
  token: string | null;
  user: AuthUser;
  session?: {
    id: string;
    token: string;
    expiresAt: Date;
    userId: string;
  };
}

export interface ChangePasswordResponse {
  token: string | null;
  user: AuthUser;
}

export interface UpdateUserResponse {
  status: boolean;
}

/**
 * better-auth throws APIError (status name + `body.message`). Anything else
 * is unexpected, so it is marked non-operational and its message is replaced by
 * the error handler in production.
 */
const toApiError = (error: Error, fallbackMessage: string): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  if (isAPIError(error)) {
    return new ApiError(
      error.body?.message ?? fallbackMessage,
      error.statusCode || httpStatus.BAD_REQUEST,
      true,
    );
  }
  return new ApiError(
    fallbackMessage,
    httpStatus.INTERNAL_SERVER_ERROR,
    false,
    error.stack ?? '',
  );
};

export const getSessionService = async (
  headers: Headers,
): Promise<AuthSession | null> => {
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    throw toApiError(error as Error, 'Unable to resolve the current session');
  }
};

export const signUpService = async (
  input: SignUpInput,
  headers: Headers,
): Promise<AuthResult<SignUpResponse>> => {
  try {
    // Because better-auth automatically masks duplicate signups when requireEmailVerification is true,
    // we explicitly check the database first so we can return the 422 error to the frontend as requested.
    const existingUsers = await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${input.email} LIMIT 1`,
    );
    if (existingUsers.rows.length > 0) {
      throw new ApiError('User already exists. Use another email.', 422, true);
    }

    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        ...(input.image !== undefined && { image: input.image }),
        ...(input.callbackURL !== undefined && {
          callbackURL: input.callbackURL,
        }),
        ...(input.rememberMe !== undefined && { rememberMe: input.rememberMe }),
      },
      // Forwarded so the session row records the real IP and user agent.
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = signUpResult.headers;
    const response: SignUpResponse = signUpResult.response;
    // Explicitly surface emailVerified: false so the frontend knows to
    // redirect to the OTP verification screen after signup.
    return {
      data: {
        ...response,
        user: { ...response.user, emailVerified: false },
      },
      headers: responseHeaders,
    };
  } catch (error) {
    throw toApiError(error as Error, 'Unable to complete sign up');
  }
};

export const signInService = async (
  input: SignInInput,
  headers: Headers,
): Promise<AuthResult<SignInResponse>> => {
  try {
    const signInResult = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
        ...(input.rememberMe !== undefined && { rememberMe: input.rememberMe }),
        ...(input.callbackURL !== undefined && {
          callbackURL: input.callbackURL,
        }),
      },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = signInResult.headers;
    const response: SignInResponse = signInResult.response;
    return { data: response, headers: responseHeaders };
  } catch (error) {
    // Intercept invalid credentials. better-auth throws a 401 APIError with
    // code "INVALID_EMAIL_OR_PASSWORD" for a wrong email/password; surface it
    // as 400 with a clearer message.
    if (
      isAPIError(error) &&
      error.statusCode === 401 &&
      error.body?.code === 'INVALID_EMAIL_OR_PASSWORD'
    ) {
      throw new ApiError(
        'Email and password is invalid',
        httpStatus.BAD_REQUEST,
        true,
      );
    }
    // Intercept the UNVERIFIED_EMAIL error and surface emailVerified: false
    // so the frontend can redirect to OTP verification instead of showing
    // a generic error message.
    if (
      isAPIError(error) &&
      (error.body?.code === 'UNVERIFIED_EMAIL' ||
        error.body?.message === 'Email not verified')
    ) {
      throw new ApiError(
        'Email not verified',
        httpStatus.FORBIDDEN,
        true,
        undefined,
        { emailVerified: false },
      );
    }
    throw toApiError(error as Error, 'Unable to complete sign in');
  }
};

export const sendOtpService = async (
  input: SendOtpInput,
  headers: Headers,
): Promise<AuthResult<OtpResponse>> => {
  try {
    const internalHeaders = new Headers(headers);
    internalHeaders.set('origin', config.betterAuthUrl);

    const otpResult = await auth.api.sendVerificationOTP({
      body: { email: input.email, type: 'email-verification' },
      headers: internalHeaders,
      returnHeaders: true,
    });
    const responseHeaders: Headers = otpResult.headers;
    const response: OtpResponse = otpResult.response;
    return { data: response, headers: responseHeaders };
  } catch (error) {
    throw toApiError(error as Error, 'Unable to send OTP');
  }
};

export const verifyEmailOtpService = async (
  input: VerifyEmailOtpInput,
  headers: Headers,
): Promise<AuthResult<VerifyEmailResponse>> => {
  try {
    const verifyResult = await auth.api.verifyEmailOTP({
      body: { email: input.email, otp: input.otp },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = verifyResult.headers;
    const response: VerifyEmailResponse = verifyResult.response;

    // Manually create and return a session token after successful verification
    const verifiedUser = await db.query.user.findFirst({
      where: eq(user.email, input.email),
    });

    if (verifiedUser) {
      const token = crypto.randomUUID();
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db.insert(session).values({
        id: sessionId,
        token: token,
        expiresAt,
        userId: verifiedUser.id,
      });

      return {
        data: {
          ...response,
          token,
          session: {
            id: sessionId,
            token,
            expiresAt,
            userId: verifiedUser.id,
          },
          user: verifiedUser as AuthUser,
        },
        headers: responseHeaders,
      };
    }

    return { data: response, headers: responseHeaders };
  } catch (error) {
    if (isAPIError(error) && error.body?.message === 'OTP expired') {
      throw new ApiError('Invalid OTP', 400, true);
    }
    throw toApiError(error as Error, 'Unable to verify email OTP');
  }
};

export const forgetPasswordService = async (
  input: ForgetPasswordInput,
  headers: Headers,
): Promise<AuthResult<OtpResponse>> => {
  try {
    const forgetResult = await auth.api.forgetPasswordEmailOTP({
      body: { email: input.email },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = forgetResult.headers;
    const response: OtpResponse = forgetResult.response;
    return { data: response, headers: responseHeaders };
  } catch (error) {
    // Do NOT reveal whether the email is registered — always return success.
    // This prevents user enumeration via the forgot-password endpoint.
    if (
      isAPIError(error) &&
      (error.statusCode === 404 ||
        error.body?.message?.toLowerCase().includes('user not found'))
    ) {
      return { data: { success: true }, headers: new Headers() };
    }
    throw toApiError(error as Error, 'Unable to send password reset OTP');
  }
};

export const verifyForgetPasswordOtpService = async (
  input: VerifyForgetPasswordOtpInput,
  headers: Headers,
): Promise<AuthResult<OtpResponse>> => {
  try {
    const verifyOtpResult = await auth.api.checkVerificationOTP({
      body: { email: input.email, type: 'forget-password', otp: input.otp },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = verifyOtpResult.headers;
    const response: OtpResponse = verifyOtpResult.response;
    return { data: response, headers: responseHeaders };
  } catch (error) {
    if (isAPIError(error) && error.body?.message === 'OTP expired') {
      throw new ApiError('Invalid OTP', 400, true);
    }
    throw toApiError(error as Error, 'Unable to verify password reset OTP');
  }
};

export const resetPasswordService = async (
  input: ResetPasswordInput,
  headers: Headers,
): Promise<AuthResult<OtpResponse>> => {
  try {
    const resetResult = await auth.api.resetPasswordEmailOTP({
      body: {
        email: input.email,
        otp: input.otp,
        password: input.password,
      },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = resetResult.headers;
    const response: OtpResponse = resetResult.response;
    return { data: response, headers: responseHeaders };
  } catch (error) {
    if (isAPIError(error) && error.body?.message === 'OTP expired') {
      throw new ApiError('Invalid OTP', 400, true);
    }
    throw toApiError(error as Error, 'Unable to reset password');
  }
};

export const changePasswordService = async (
  input: ChangePasswordInput,
  headers: Headers,
): Promise<AuthResult<ChangePasswordResponse>> => {
  try {
    const changeResult = await auth.api.changePassword({
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true, // Auto-revoke for better security
      },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = changeResult.headers;
    const response: ChangePasswordResponse = changeResult.response;
    return { data: response, headers: responseHeaders };
  } catch (error) {
    if (
      isAPIError(error) &&
      (error.body?.message === 'INVALID_PASSWORD' ||
        error.body?.message === 'Invalid password')
    ) {
      throw new ApiError(
        'Current password is incorrect',
        httpStatus.BAD_REQUEST,
        true,
      );
    }
    throw toApiError(error as Error, 'Unable to change password');
  }
};

export interface AbrBusinessDetails {
  Abn: string;
  AbnStatus: string;
  AbnStatusEffectiveFrom: string;
  Acn: string;
  AddressDate: string;
  AddressPostcode: string;
  AddressState: string;
  BusinessName: string[];
  EntityName: string;
  EntityTypeCode: string;
  EntityTypeName: string;
  GST: string;
  Message: string;
}

export const getBusinessDetailsService = async (
  abn: string,
): Promise<AbrBusinessDetails> => {
  try {
    // Clean ABN of any spaces or non-alphanumeric characters
    const cleanAbn = abn.replace(/[^0-9]/g, '');

    if (!cleanAbn) {
      throw new ApiError(
        'Valid ABN or ACN is required',
        httpStatus.BAD_REQUEST,
      );
    }

    const url = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${cleanAbn}&guid=${config.abrGuid}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ABR API returned status ${response.status}`);
    }

    const text = await response.text();

    const jsonMatch = text.match(/^callback\((.*)\)$/s);

    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error('Invalid response format from ABR API');
    }

    const data: AbrBusinessDetails = JSON.parse(jsonMatch[1]);

    // Handle ABR API specific error messages within the JSON payload
    if (data.Message && data.Message.trim() !== '') {
      throw new ApiError(data.Message, httpStatus.BAD_REQUEST);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch business details',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateUserBusinessDetailsService = async (
  input: UpdateBusinessInput,
  headers: Headers,
): Promise<AuthResult<UpdateUserResponse>> => {
  try {
    const updateResult = await auth.api.updateUser({
      body: {
        isBusiness: true,
        abn: input.abn,
        businessName: input.businessName,
      },
      headers,
      returnHeaders: true,
    });
    const responseHeaders: Headers = updateResult.headers;
    const response: UpdateUserResponse = updateResult.response;

    if (!response || !response.status) {
      throw new ApiError('Failed to update user', httpStatus.BAD_REQUEST);
    }

    return { data: response, headers: responseHeaders };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw toApiError(error as Error, 'Failed to update user business details');
  }
};

export const deleteAccountService = async (
  userId: string,
  input: DeleteAccountInput,
  headers: Headers,
): Promise<{ success: boolean }> => {
  try {
    // 1. Verify the password by attempting to sign in via better-auth's
    //    internal verifyPassword endpoint.
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { email: true },
    });

    if (!userRecord) {
      throw new ApiError('User not found', httpStatus.NOT_FOUND, true);
    }

    // Verify password using better-auth's built-in API
    try {
      await auth.api.verifyPassword({
        body: {
          password: input.password,
        },
        headers,
      });
    } catch {
      throw new ApiError(
        'Incorrect password. Please try again.',
        httpStatus.BAD_REQUEST,
        true,
      );
    }

    // 2. Delete the user — all related data (sessions, accounts, jobs,
    //    quotes, deliveries) will be cascade-deleted by the database.
    await db.delete(user).where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw toApiError(error as Error, 'Failed to delete account');
  }
};
