import { ErrorHandlerCalss } from "../utils/index.js";

export const authorization = (allowedRules) => {
  return async (req, res, next) => {
    try {
      const user = req.authUser; // logedin user
      if (!allowedRules.includes(user.role)) {
        return next (new ErrorHandlerCalss(
          "Unauthorized Access",
          403,
          "You are not authorized to perform this action",
          "error in authorization middleware"
        ));
      }
      next();
    } catch (error) {
      return next(
        new ErrorHandlerCalss(
          error.message,
          500,
          error.stack,
          "error in authorization middleware"
        )
      );
    }
  };
};
