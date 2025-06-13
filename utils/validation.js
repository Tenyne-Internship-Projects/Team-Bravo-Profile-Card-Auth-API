import joi from 'joi'

export const registerValidator = joi.object({
  name:joi.string().min(2).max(100).required(),
  email:joi.string().email().required(),
  password:joi.string()
    .pattern(
      new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={};':"\\|,.<>/?]).{8,}$/)
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
    }),
  confirmPassword:joi.string()
    .valid(joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});
