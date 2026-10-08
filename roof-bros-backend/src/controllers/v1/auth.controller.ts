import type { Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import httpStatus from 'http-status';
import catchAsync from '../../shared/utils/catchAsync.ts';
import {
  signUpService,
  signInService,
  sendOtpService,
  verifyEmailOtpService,
  forgetPasswordService,
  resetPasswordService,
  verifyForgetPasswordOtpService,
  changePasswordService,
  getBusinessDetailsService,
  updateUserBusinessDetailsService,
  deleteAccountService,
  storeAppleTokenService,
} from '../../services/auth/auth.service.ts';
import ApiResponse from '../../shared/utils/ApiResponse.ts';

import type {
  SignInInput,
  SignUpInput,
  SendOtpInput,
  VerifyEmailOtpInput,
  ForgetPasswordInput,
  ResetPasswordInput,
  VerifyForgetPasswordOtpInput,
  ChangePasswordInput,
  DeleteAccountInput,
  StoreAppleTokenInput,
} from '../../shared/validations/auth.validation.ts';

const forwardAuthCookies = (res: Response, headers: Headers): void => {
  const cookies = headers.getSetCookie();
  if (cookies.length > 0) {
    res.setHeader('Set-Cookie', cookies);
  }
};

export const signUp = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await signUpService(
    req.body as SignUpInput,
    fromNodeHeaders(req.headers),
  );

  forwardAuthCookies(res, headers);

  return res
    .status(httpStatus.CREATED)
    .json(ApiResponse.success('Account created successfully', data));
});

export const signIn = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await signInService(
    req.body as SignInInput,
    fromNodeHeaders(req.headers),
  );

  forwardAuthCookies(res, headers);

  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Signed in successfully', data));
});

/** Mounted behind `requireAuth`, which has already resolved the session. */
export const getSession = catchAsync(async (req: Request, res: Response) => {
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Session fetched successfully', req.auth));
});

export const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await sendOtpService(
    req.body as SendOtpInput,
    fromNodeHeaders(req.headers),
  );
  forwardAuthCookies(res, headers);
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('OTP sent successfully', data));
});

export const verifyEmailOtp = catchAsync(
  async (req: Request, res: Response) => {
    const { data, headers } = await verifyEmailOtpService(
      req.body as VerifyEmailOtpInput,
      fromNodeHeaders(req.headers),
    );
    forwardAuthCookies(res, headers);
    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Email verified successfully', data));
  },
);

export const forgetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { data, headers } = await forgetPasswordService(
      req.body as ForgetPasswordInput,
      fromNodeHeaders(req.headers),
    );
    forwardAuthCookies(res, headers);
    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Password reset OTP sent successfully', data));
  },
);

export const verifyForgetPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const { data, headers } = await verifyForgetPasswordOtpService(
      req.body as VerifyForgetPasswordOtpInput,
      fromNodeHeaders(req.headers),
    );
    forwardAuthCookies(res, headers);
    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.success('Password reset OTP verified successfully', data),
      );
  },
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await resetPasswordService(
    req.body as ResetPasswordInput,
    fromNodeHeaders(req.headers),
  );
  forwardAuthCookies(res, headers);
  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success('Password reset successfully', data));
});

export const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const { data, headers } = await changePasswordService(
      req.body as ChangePasswordInput,
      fromNodeHeaders(req.headers),
    );
    forwardAuthCookies(res, headers);
    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Password changed successfully', data));
  },
);

export const getBusinessDetails = catchAsync(
  async (req: Request, res: Response) => {
    const abn = req.params.abn as string;
    const data = await getBusinessDetailsService(abn);

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Business details fetched successfully', data));
  },
);

export const updateBusinessDetails = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;

    const { data, headers } = await updateUserBusinessDetailsService(
      body,
      fromNodeHeaders(req.headers),
    );

    forwardAuthCookies(res, headers);

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success('Business details updated successfully', data));
  },
);

export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.auth?.user?.id as string;

  const result = await deleteAccountService(
    userId,
    req.body as DeleteAccountInput,
    fromNodeHeaders(req.headers),
  );

  return res
    .status(httpStatus.OK)
    .json(ApiResponse.success(result.message, { success: result.success }));
});

export const storeAppleToken = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.auth?.user?.id as string;

    const result = await storeAppleTokenService(
      userId,
      req.body as StoreAppleTokenInput,
    );

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.success(result.message, { success: result.success }));
  },
);
