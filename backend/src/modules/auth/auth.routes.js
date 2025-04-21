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
authRouter.post(
  "/select-role/:userId",
  validation(validate.selectRoleSchema),
  errorHandling(authController.selectRole)
);

authRouter.post(
  "/forget-password",
  errorHandling(authController.forgetPassword)
);

authRouter.post(
  "/verify-forgetPass-otp",
  authController.verifyPasswordOTP
);

authRouter.post("/resend-otp", authController.resendOtp);

authRouter.patch(
  "/reset-password",
  errorHandling(authController.resetPassword)
);

authRouter.post(
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
