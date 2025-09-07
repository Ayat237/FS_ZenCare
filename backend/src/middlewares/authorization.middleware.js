import { ErrorHandlerClass } from "../utils/index.js";

export const authorization = (allowedRules) => {
  return async (req, res, next) => {
    try {
      const user = req.authUser; // logedin user
      // Check if user has at least one allowed role
      const hasAllowedRole = Array.isArray(allowedRules) 
        ? user.role.some(role => allowedRules.includes(role))
        : user.role.includes(allowedRules);
      
      if (!hasAllowedRole) {
        console.log("user", user.role);
        console.log("allowedRules", allowedRules);
        return next (new ErrorHandlerClass(
          "Unauthorized Access",
          403,
          "You are not authorized to perform this action",
          "error in authorization middleware"
        ));
      }
      next();
    } catch (error) {
      return next(
        new ErrorHandlerClass(
          error.message,
          500,
          error.stack,
          "error in authorization middleware"
        )
      );
    }
  };
};
