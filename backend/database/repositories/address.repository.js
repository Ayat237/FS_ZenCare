import BaseModel from "../models/base.model.js";

class AddressRepository extends BaseModel {
  constructor(database) {
    super(database, "address");
  }

  async findByPatientId(patientId) {
    return await this.findOne({ patientId });
  }

  async findByDoctorId(doctorId) {
    return await this.findOne({ doctorId });
  }

  async findByUser(userId) {
    return await this.findOne({
      $or: [{ patientId: userId }, { doctorId: userId }],
    });
  }

  async updateByUser(userId, updateData) {
    const address = await this.findByUser(userId);
    if (!address) {
      throw new Error("Address not found for this user");
    }
    return await this.updateById(address._id, updateData);
  }

  async deleteByUser(userId) {
    const address = await this.findByUser(userId);
    if (!address) {
      throw new Error("Address not found for this user");
    }
    return await this.deleteById(address._id);
  }

  async findByCoordinates(longitude, latitude, radius = 10) {
    // Find addresses within a certain radius (in kilometers)
    return await this.find({
      "coordinates.longitude": {
        $gte: longitude - radius / 111.32, // Approximate conversion
        $lte: longitude + radius / 111.32,
      },
      "coordinates.latitude": {
        $gte: latitude - radius / 111.32,
        $lte: latitude + radius / 111.32,
      },
    });
  }
}

export default AddressRepository;