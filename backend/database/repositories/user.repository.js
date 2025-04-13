import { logger } from "../../src/utils/logger.utils.js";
import BaseModel from "../models/base.model.js";

class UserRepository extends BaseModel {
    constructor(database) {
        super(database, "User");
    }

    async findByEmail(email) {
        try {
          const result = await this.database.findByEmail(email);
          if (!result) throw new Error('User not found');
          logger.debug('Found user by email in repository', { email });
          return result;
        } catch (error) {
          logger.error('Failed to find user by email in repository', { 
            error: error.message, 
            stack: error.stack,
            email 
          });
          throw error;
        } 
      }
    // async createUser(userData) {
    //     try {
    //         const user = await this.collection.create(userData);
    //         return user;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // async findUserByEmail(email) {
    //     try {
    //         const user = await this.collection.findOne({ email });
    //         return user;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // async findUserById(userId) {
    //     try {
    //         const user = await this.collection.findById(userId);
    //         return user;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // async updateUser(userId, updateData) {
    //     try {
    //         const updatedUser = await this.collection.findByIdAndUpdate(
    //             userId,
    //             updateData,
    //             { new: true }
    //         );
    //         return updatedUser;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // async deleteUser(userId) {
    //     try {
    //         const deletedUser = await this.collection.findByIdAndDelete(userId);
    //         return deletedUser;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // async findUserByResetToken(resetToken) {
    //     try {
    //         const user = await this.collection.findOne({
    //             resetPasswordToken: resetToken,
    //             resetPasswordExpires: { $gt: Date.now() }
    //         });
    //         return user;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}

export default UserRepository;