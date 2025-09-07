import { ErrorHandlerClass, logger } from "../utils/index.js";

// export const errorHandling = (API) => {
//   return async (req, res, next) => {
//     API(req, res, next)?.catch((err) => {
//       logger.error("Error in error-handling middleware is",err.message) ;
//       const insights = {
//         error: "unhandled error",
//       };
//       next(
//         new ErrorHandlerClass(
//           "Inernal server error. Please try again later.",
//           500,
//           err.stack,
//           "Error in error-handling middleware",
//           insights
//         )
//       );
//     });
//   };
// };

export const errorHandling = (API) => {
  return async (req, res, next) => {
    API(req, res, next)?.catch((err) => {
      logger.error("Error in error-handling middleware is", err.message);

      // If the error is already an ErrorHandlerClass instance, pass it directly
      if (err instanceof ErrorHandlerClass) {
        return next(err);
      }

      // For unexpected errors, create a new ErrorHandlerClass instance
      const insights = {
        error: "unhandled error",
      };
      next(
        new ErrorHandlerClass(
          "Internal server error. Please try again later.",
          500,
          "Error",
          "Error in error-handling middleware",
          insights
        )
      );
    });
  };
};

// export const globalResponse = async (err, req, res, next) => {
//   if (err) {
//     res.status(err["stausCode"] || 500).json({
//       message:"Inernal server error. Please try again later",
//       error: err.message,
//       stack: err.stack, // where the error occurred in code
//       errorPosition: err.position,
//       data: err.data
//     });
//   }
// };



export const globalResponse = async (err, req, res, next) => {
  if (err) {
    res.status(err["stausCode"] || 500).json({
      success: (err["stausCode"] >= 200 && err["stausCode"] < 300) ? false : false,
      message: err.message || "Internal server error. Please try again later",
      error: err.message || "Internal server error. Please try again later",
      stack: err.stack || "Something went wrong", // Use status as stack for Interaction Warning
      errorPosition: err.position || "Unknown position",
      data: err.data || null
    });
  }
};
