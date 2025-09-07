import express from "express";
import * as addressController from "./address.controller.js";
import {
  authenticattion,
  authorization,
  errorHandling,
  validation,
} from "../../middlewares/index.js";
import * as VSchema from "./address.validation.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";

const addressRouter = express.Router();

// Create a new address
addressRouter.post(
  "/admin",
  authenticattion(),
  authorization(possibleRoles.DOCTOR_PATIENT_ROLE),
  errorHandling(validation(VSchema.createAddressSchema)),
  errorHandling(addressController.createAddress)
);

// Get address by user ID
addressRouter.get(
  "/user/:userId",
  authenticattion(),
  authorization([possibleRoles.ADMIN, possibleRoles.DOCTOR, possibleRoles.PATIENT]),
  errorHandling(validation(VSchema.getAddressByUserSchema)),
  errorHandling(addressController.getAddressByUser)
);

// Update address by user ID
addressRouter.patch(
  "/user/:userId",
  authenticattion(),
  authorization([possibleRoles.ADMIN, possibleRoles.DOCTOR, possibleRoles.PATIENT]),
  errorHandling(validation(VSchema.updateAddressSchema)),
  errorHandling(addressController.updateAddress)
);

// Delete address by user ID
addressRouter.delete(
  "/user/:userId",
  authenticattion(),
  authorization([possibleRoles.ADMIN, possibleRoles.DOCTOR, possibleRoles.PATIENT]),
  errorHandling(validation(VSchema.deleteAddressSchema)),
  errorHandling(addressController.deleteAddress)
);

// Find nearby addresses
addressRouter.get(
  "/nearby",
  authenticattion(),
  authorization([possibleRoles.ADMIN, possibleRoles.DOCTOR, possibleRoles.PATIENT]),
  errorHandling(validation(VSchema.findNearbyAddressesSchema)),
  errorHandling(addressController.findNearbyAddresses)
);

// Get all addresses (admin only)
addressRouter.get(
  "/",
  authenticattion(),
  authorization([possibleRoles.ADMIN]),
  errorHandling(validation(VSchema.getAllAddressesSchema)),
  errorHandling(addressController.getAllAddresses)
);

export { addressRouter }; 