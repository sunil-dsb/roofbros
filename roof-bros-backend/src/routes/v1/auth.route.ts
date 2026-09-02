import express, { type Router } from 'express';
import {
  signUp,
  signIn,
  getSession,
  sendOtp,
  verifyEmailOtp,
  forgetPassword,
  verifyForgetPasswordOtp,
  resetPassword,
  changePassword,
  getBusinessDetails,
  updateBusinessDetails,
  deleteAccount,
} from '../../controllers/v1/auth.controller.ts';
import { validate, validateParams } from '../../shared/middlewares/validate.ts';
import { requireAuth } from '../../shared/middlewares/authenticate.middlewares.ts';
import {
  signInLimiter,
  signUpLimiter,
  sessionLimiter,
  otpLimiter,
  passwordChangeLimiter,
} from '../../shared/middlewares/rateLimit.middleware.ts';
import {
  signInSchema,
  signUpSchema,
  sendOtpSchema,
  verifyEmailOtpSchema,
  forgetPasswordSchema,
  verifyForgetPasswordOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateBusinessSchema,
  businessDetailsParamsSchema,
  deleteAccountSchema,
} from '../../shared/validations/auth.validation.ts';

const authRoute: Router = express.Router();

authRoute.post('/sign-up/email', signUpLimiter, validate(signUpSchema), signUp);

authRoute.post('/sign-in/email', signInLimiter, validate(signInSchema), signIn);

authRoute.post('/otp/send', otpLimiter, validate(sendOtpSchema), sendOtp);

authRoute.post(
  '/verify-email',
  otpLimiter,
  validate(verifyEmailOtpSchema),
  verifyEmailOtp,
);

authRoute.post(
  '/password/forget',
  validate(forgetPasswordSchema),
  forgetPassword,
);

authRoute.post(
  '/password/forget/verify',
  validate(verifyForgetPasswordOtpSchema),
  verifyForgetPasswordOtp,
);

authRoute.post(
  '/password/reset',
  otpLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

authRoute.post(
  '/password/change',
  requireAuth,
  passwordChangeLimiter,
  validate(changePasswordSchema),
  changePassword,
);

authRoute.get('/me', sessionLimiter, requireAuth, getSession);

// Business details validation (requires authentication)
authRoute.get(
  '/business-details/:abn',
  requireAuth,
  validateParams(businessDetailsParamsSchema),
  getBusinessDetails,
);

authRoute.put(
  '/me/business',
  requireAuth,
  validate(updateBusinessSchema),
  updateBusinessDetails,
);

authRoute.delete(
  '/delete/me',
  requireAuth,
  validate(deleteAccountSchema),
  deleteAccount,
);

export default authRoute;
