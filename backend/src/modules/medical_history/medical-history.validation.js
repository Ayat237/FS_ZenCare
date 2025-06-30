import Joi from "joi";
import {
  Diseases,
  DiseaseType,
  LifeStyleName,
  MedicineType,
} from "../../utils/enums.utils.js";
import { generalRules } from "../../utils/general-rules.utils.js";

export const addMedicalHistorySchema = {
    body: Joi.object({
      diagnoses: Joi.array().items(
        Joi.object({
          type: Joi.string().valid(...Object.values(DiseaseType)).required(),
          name: Joi.string().valid(...Object.values(Diseases)).required(),
          date: Joi.date().required(),
          medications: Joi.array().items(
            Joi.object({
              name: Joi.string().required(),
              type: Joi.string().valid(...Object.values(MedicineType)).required(),
            })
          ),
          attachment: Joi.object({
            file: Joi.any().optional(), // Allow file during validation (will be handled by multer)
            URL: Joi.object({
              public_id: Joi.string().allow(null, ""),
              secure_url: Joi.string().allow(null, ""),
            }).optional(),
            customId: Joi.string().allow(null, ""),
          }).optional(),
        })
      ).optional(),
      testsAndRays: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          diseaseName: Joi.string().valid(...Object.values(Diseases)).required(),
          description: Joi.string().allow(""),
          attachment: Joi.object({
            file: Joi.any().optional(), // Allow file during validation
            URL: Joi.object({
              public_id: Joi.string(),
              secure_url: Joi.string(),
            }).optional(),
            customId: Joi.string(),
          }).optional(),
          date: Joi.date().required(),
        })
      ).optional(),
      surgeries: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().allow(""),
          date: Joi.date().required(),
        })
      ).optional(),
      vaccination: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().allow(""),
          date: Joi.date().required(),
        })
      ).optional(),
      lifeStyles: Joi.array().items(
        Joi.string().valid(...Object.values(LifeStyleName)).optional()
      ).optional(),
    })
  };

export const updateMedicalHistorySchema = {
  body: Joi.object({
    diagnoses: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
        type: Joi.string().valid(...Object.values(DiseaseType)).optional(),
        name: Joi.string().valid(...Object.values(Diseases)).optional(),
        date: Joi.date().optional(),
        // medications can be added, updated, or deleted by _id
        medications: Joi.array().items(
          Joi.object({
            _id: generalRules.id.optional(),
            name: Joi.string().optional(),
            type: Joi.string().valid(...Object.values(MedicineType)).optional(),
          })
        ).optional(),
        attachment: Joi.object({
          file: Joi.any().optional(), // Allow file during validation
          URL: Joi.object({
            public_id: Joi.string().allow(null, ""),
            secure_url: Joi.string().allow(null, ""),
          }).optional(),
          customId: Joi.string().allow(null, ""),
        }).optional(),
      })
    ).optional(),
    testsAndRays: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
        name: Joi.string().optional(),
        diseaseName: Joi.string().valid(...Object.values(Diseases)).optional(),
        description: Joi.string().allow("").optional(),
        attachment: Joi.object({
          file: Joi.any().optional(), // Allow file during validation
          URL: Joi.object({
            public_id: Joi.string(),
            secure_url: Joi.string(),
          }).optional(),
          customId: Joi.string(),
        }).optional(),
        date: Joi.date().optional(),
   
      })
    ).optional(),
    surgeries: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
        name: Joi.string().optional(),
        description: Joi.string().allow("").optional(),
        date: Joi.date().optional(),
      })
    ).optional(),
    vaccination: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
        name: Joi.string().optional(),
        description: Joi.string().allow("").optional(),
        date: Joi.date().optional(),
      })
    ).optional(),
    lifeStyles: Joi.array().items(
      Joi.string().valid(...Object.values(LifeStyleName)).optional()
    ).optional(),
  })
};

export const deleteMedicalHistorySchema = {
  body: Joi.object({
    diagnoses: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
        medications: Joi.array().items(
          Joi.object({
            _id: generalRules.id.required(),
          })
        ).optional(),
      })
    ).optional(),
    testsAndRays: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
      })
    ).optional(),
    surgeries: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
      })
    ).optional(),
    vaccination: Joi.array().items(
      Joi.object({
        _id: generalRules.id.required(),
      })
    ).optional(),
    lifeStyles: Joi.array().items(
      Joi.string().valid(...Object.values(LifeStyleName)).required()
    ).optional(),
  }).min(1).messages({
    "object.min": "At least one section must be specified for deletion",
  })
};