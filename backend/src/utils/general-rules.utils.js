import Joi from "joi";
import { DateTime } from "luxon";
import { Types } from "mongoose";

export const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid ObjectId");
};

export function validateEndDateTime(value, helpers) {
const { startDateTime } = helpers.state.ancestors[0];

        const start = DateTime.fromISO(startDateTime);
        const end = DateTime.fromISO(value);

        if (!start.isValid || !end.isValid) {
          return helpers.message('Invalid date format');
        }

        if (end <= start) {
          return helpers.message('"endDateTime" must be after "startDateTime"');
        }

        return value; 
  
}

export const generalRules = {
  id: Joi.custom(objectIdValidation).required(),
  email: Joi.string()
    .email({
      tlds: { allow: ["com"] },
      minDomainSegments: 2,
      maxDomainSegments: 4,
    })
    .required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
    )
    .required(),
  phoneNumber: Joi.array()
    .items(
      Joi.string()
        .pattern(/^01[0-2,5]\d{1,8}$/)
        .required()
    )
    .required(),
  endDate:Joi.string().isoDate().custom(validateEndDateTime).required(),
  headers: {
    "content-type": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    host: Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    "accept-language": Joi.string(),
    "accept-charset": Joi.string(),
    "postman-token": Joi.string(),
    "postman-id": Joi.string(),
    connection: Joi.string(),
    token: Joi.string(),
  },
};
