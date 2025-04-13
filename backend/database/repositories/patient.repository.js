import BaseModel from "../models/base.model.js";

class PatientRepository extends BaseModel {
    constructor(database) {
        super(database, "Patient");
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

export default PatientRepository;