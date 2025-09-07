import { Router } from "express";
import * as authController from "./auth.controller.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validate from "./auth.validation.js";
import { authenticattion } from "../../middlewares/index.js";

const authRouter = Router();

authRouter.post(
  "/login",
  errorHandling(validation(validate.loginSchema)),
  errorHandling(authController.login)
);
authRouter.post(
  "/select-role/:userId",
  errorHandling(validation(validate.selectRoleSchema)),
  errorHandling(authController.selectRole)
);

authRouter.post(
  "/verify-email-otp",
  errorHandling(validation(validate.verifyEmailOTPSchema)),
  errorHandling(authController.verifyEmailOTP)
);

authRouter.post(
  "/resend-otp",
  errorHandling(validation(validate.resendOtpSchema)),
  errorHandling(authController.resendOtp)
);



authRouter.post(
  "/forget-password",
  errorHandling(validation(validate.forgetPasswordSchema)),
  errorHandling(authController.forgetPassword)
);

authRouter.post(
  "/verify-forgetPass-otp",
  errorHandling(validation(validate.verifyPasswordOTPSchema)),
  errorHandling(authController.verifyPasswordOTP)
);

authRouter.post(
  "/resend-otp-password",
  errorHandling(validation(validate.resendOtpPasswordSchema)),
  errorHandling(authController.resendOtpPassword)
);

authRouter.patch(
  "/reset-password",
  errorHandling(validation(validate.resetPasswordSchema)),
  errorHandling(authController.resetPassword)
);

authRouter.post(
  "/logout",
  authenticattion(),
  errorHandling(validation(validate.logoutSchema)),
  errorHandling(authController.logout)
);

authRouter.get(
  "/user-profile",
  authenticattion(),
  errorHandling(validation(validate.getLoggedInProfileSchema)),
  errorHandling(authController.getLoggedInProfile)
);

authRouter.put(
  "/update",
  authenticattion(),
  errorHandling(validation(validate.updateAccountSchema)),
  errorHandling(authController.updateAccount)
);

authRouter.patch(
  "/verify-newEmail",
  authenticattion(),
  errorHandling(validation(validate.verifyNewEmailSchema)),
  errorHandling(authController.verifyNewEmail)
);

authRouter.post(
  "/signUp-withGoogle",
  errorHandling(validation(validate.googleSignUpSchema)),
  errorHandling(authController.signupWithGoogle)
);

authRouter.post(
  "/login-withGoogle",
  errorHandling(validation(validate.googleLoginSchema)),
  errorHandling(authController.loginWithGoogle)
);

authRouter.post(
  "/refresh-token",
  errorHandling(validation(validate.refreshTokenSchema)),
  errorHandling(authController.refreshToken)
);

export { authRouter };
