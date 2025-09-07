import { Images } from "./enums.utils.js";

export const getDefaultImageByGender = (gender) => {
  switch (gender?.toLowerCase()) {
    case "male":
      return {
        secure_url:
          process.env.DEFAULT_PATIENT_MALE ||
          "https://res.cloudinary.com/dcvfc0cje/image/upload/v1745370317/714_hcmcmh.jpg",
        public_id: Images.PATIENT_MALE,
      };
    case "female":
      return {
        secure_url:
          process.env.DEFAULT_PATIENT_FEMALE ||
          "https://res.cloudinary.com/dcvfc0cje/image/upload/v1745370277/5782734544632401678_di6bhz.jpg",
        public_id: Images.PATIENT_FEMALE,
      };
    case "other":
    default:
      return {
        secure_url:
          process.env.DEFAULT_PROFILE_IMAGE ||
          "https://res.cloudinary.com/dcvfc0cje/image/upload/v1741650768/default_r5hh3m.png",
        public_id: Images.OTHER,
      };
  }
};
