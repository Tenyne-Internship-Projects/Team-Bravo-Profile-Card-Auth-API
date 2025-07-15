import joi from "joi";
//registerValidator
export const registerValidator = joi.object({
  name: joi.string().min(2).max(100).required(),
  username: joi.string().alphanum().min(3).max(30).optional().allow("", null),
  email: joi.string().email().required(),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={};':"\\|,.<>/?]).{12,}$/
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 12 characters long and include uppercase, lowercase, number, and special character",
    }),
  confirmPassword: joi
    .string()
    .valid(joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  role: joi
    .string()
    .valid("FREELANCER", "CLIENT", "RECRUITER", "ADMIN")
    .required(),
  secret: joi.string().optional(), // only needed if role === "ADMIN"
});

// createProfileValidator
export const createProfileValidator = joi.object({
  fullName: joi.string().min(3).max(100).required(),
  username: joi.string().alphanum().min(3).max(30).required(),
  email: joi.string().email().required(),
  phone: joi.string().min(8).max(20).required(),
  country: joi.string().required(),
  state: joi.string().required(),
  city: joi.string().required(),
  bio: joi.string().min(150).max(2500).required(),
  skills: joi.string().max(300).required(),
  github: joi.string().uri().optional().allow("", null),
  linkedin: joi.string().uri().optional().allow("", null),
  portfolio: joi.string().uri().optional().allow("", null),
  availability: joi.string().valid("available", "unavailable").optional(),
  tools: joi.string().optional().allow("", null),
});

// updateProfileValidator
export const updateProfileValidator = joi.object({
  fullName: joi.string().min(3).max(100).optional(),
  username: joi.string().alphanum().min(3).max(30).optional(),
  email: joi.string().email().optional(),
  phone: joi.string().min(8).max(20).optional(),
  country: joi.string().optional(),
  state: joi.string().optional(),
  city: joi.string().optional(),
  bio: joi.string().max(2500).optional(),
  skills: joi.string().max(300).optional(),
  github: joi.string().uri().optional().allow("", null),
  linkedin: joi.string().uri().optional().allow("", null),
  portfolio: joi.string().uri().optional().allow("", null),
  availability: joi.string().valid("available", "unavailable").optional(),
  tools: joi.string().optional().allow("", null),
});

// searchProfilesValidator
export const searchProfilesValidator = joi.object({
  search: joi.string().min(1).max(100).optional(),
  skills: joi.string().optional(),
  country: joi.string().optional(),
  city: joi.string().optional(),
  page: joi.number().integer().min(1).optional(),
  limit: joi.number().integer().min(1).max(100).optional(),
});

// uploadFilesValidator
export const uploadFilesValidator = joi.object({
  userId: joi.number().required(),
});
