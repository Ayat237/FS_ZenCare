import { ErrorHandlerClass, logger } from "../utils/index.js";

export const errorHandling = (API) => {
  return async (req, res, next) => {
    API(req, res, next).catch((err) => {
      logger.error("Error in error-handling middleware is",err.message) ;
      const insights = {
        error: "unhandled error",
      };
      next(
        new ErrorHandlerClass(
          "Inernal server error. Please try again later.",
          500,
          err.stack,
          "Error in error-handling middleware",
          insights
        )
      );
    });
  };
};

export const globalResponse = async (err, req, res, xnext) => {
  if (err) {
    res.status(err["stausCode"] || 500).json({
      message:"Inernal server error. Please try again later",
      error: err.message,
      stack: err.stack, // where the error occurred in code
      errorPosition: err.position,
      data: err.data
    });
  }
};
