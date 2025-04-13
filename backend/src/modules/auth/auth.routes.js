import { Router } from "express";
import * as authController from "./auth.controller.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validate from "./auth.validation.js";
import { authenticattion } from "../../middlewares/index.js";

const authRouter = Router();

authRouter.post(
  "/login",
  validation(validate.loginSchema),
  errorHandling(authController.login)
);
authRouter.get(
  "/select-role/:userId",
  validation(validate.selectRoleSchema),
  errorHandling(authController.selectRole)
);

authRouter.get(
  "/forget-password",
  errorHandling(authController.forgetPassword)
);

authRouter.patch(
  "/verify-forgetPass-otp/:emailToken",
  authController.verifyPasswordOTP
);

authRouter.get("/resend-otp/:emailToken", authController.resendOtp);

authRouter.patch(
  "/reset-password/:emailToken",
  errorHandling(authController.resetPassword)
);

authRouter.get(
  "/logout",
  authenticattion(),
  errorHandling(authController.logout)
);

authRouter.get(
  "/user-profile",
  authenticattion(),
  errorHandling(authController.getLoggedInProfile)
);

authRouter.put(
  "/update",
  authenticattion(),
  errorHandling(authController.updateAccount)
);

authRouter.patch(
  "/verify-newEmail",
  authenticattion(),
  errorHandling(authController.verifyNewEmail)
);

authRouter.post(
  "/signUp-withGoogle",
  errorHandling(authController.signupWithGoogle)
)

authRouter.post(
  "/login-withGoogle",
  errorHandling(authController.loginWithGoogle)
)

authRouter.post(
  "/refresh-token",
  errorHandling(authController.refreshToken)
)



export { authRouter };
