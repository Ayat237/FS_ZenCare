import jwt from "jsonwebtoken";
import { ErrorHandlerClass, logger } from "../utils/index.js";
import dotenv from "dotenv";
import { UserModel } from "../../database/models/index.js";
import database from "../../database/databaseConnection.js";
import redisClient from "../utils/redis.utils.js";

import { config } from "dotenv";
import path from "path";
config  ({ path: path.resolve("config\.dev.env") });

//dotenv.config();
const userModel = new UserModel(database);

export const  authenticattion = () => {
  return async (req, res, next) => {
    try {
      const { token } = req.headers;
      if (!token) {
        return next(
          new ErrorHandlerClass(
            "No token provided or invalid header format",
            401,
            "Authentication Error",
            "Authorization header missing or malformed"
          )
        );
      }

      if (!token.startsWith("Bearer_")) {
        return next(
          new ErrorHandlerClass(
            "Invalid header format",
            401,
            "Authentication Error",
            "Authorization header missing or malformed"
          )
        );
      }

      const originalToken = token.split("_")[1];
      if (!originalToken) {
        return next(
          new ErrorHandlerClass(
            "No token provided",
            401,
            "Authentication Error",
            "Token missing"
          )
        );
      }

      const loginSecretKey = process.env.ACCESS_TOKEN_SECRET; 
      console.log("loginSecretKey",loginSecretKey);
      let decodedToken;
      try {
       decodedToken = jwt.verify(originalToken,loginSecretKey);
      } catch (jwtError) {
        if (jwtError.name === "TokenExpiredError") {
          return next(
            new ErrorHandlerClass(
              "Token has expired",
              401,
              "Authentication Error",
              "Token expired"
            )
          );
        }
        return next(
          new ErrorHandlerClass(
            "Invalid token",
            401,
            "Authentication Error",
            jwtError.message
          )
        );
      }

      if (!decodedToken?.userId) {
        res.status(400).json({ message: "Invalid token payload" });
      }

      // 2. Check if token is blacklisted (e.g., after logout)
      const isBlacklisted = await redisClient.GET(
        `blacklist:${decodedToken.userId}`
      );
      if (isBlacklisted) {
        return next(
          new ErrorHandlerClass(
            "Token is blacklisted",
            401,
            "Authentication Error",
            "Token has been revoked"
          )
        );
      }
      
      
      const user = await userModel.findById(decodedToken.userId, {
        select: "-password",
        populate: "patientID doctorID",
      });
     
      
      if (!user) {
        return next(
          new ErrorHandlerClass(
            "User not found",
            404,
            "Authentication Error",
            "Error in retrieving user"
          )
        );
      }
      req.authUser = user;

      logger.info("User authenticated successfully", { userId: user._id });
      next();
    } catch (error) {
      logger.error("Authentication middleware error", error);
      next(
        new ErrorHandlerClass(
          error.message,
          500,
          "Authentication Error",
          "Unexpected error in authentication middleware"
        )
      );
    }
  };
};
