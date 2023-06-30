import joi from 'joi';

export const signupUserValidations = joi.object().keys({
  username: joi.string().required().max(15).lowercase().trim(),
  phoneNumber: joi
    .string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .required(),
  password: joi
    .string()
    .trim()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    .error(
      new Error(
        'Password must contain at least one lower case letter, one uppercase letter, at least 1 digit, at least one special character and minimum 8 characters'
      )
    ),
  countryCode: joi.string().required(),
  email: joi.string().email().trim().lowercase().required(),
  fullName: joi.string().required().trim(),
  profilePicture: joi.allow(),
});

export const signinUserValidations = joi.object().keys({
  emailOrUsername: joi.string().trim().lowercase().required(),
  password: joi.string().required(),
});

export const verifyUserValidations = joi.object().keys({
  email: joi.string().email().trim().lowercase().required(),
  verificationCode: joi.number().required(),
});

export const resendVerificationValidation = joi.object().keys({
  email: joi.string().email().trim().lowercase().required(),
});

export const changePasswordValidation = joi.object().keys({
  oldPassword: joi.string().required(),
  newPassword: joi
    .string()
    .trim()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    .error(
      new Error(
        'Password must contain at least one lower case letter, one uppercase letter, at least 1 digit, at least one special character and minimum 8 characters'
      )
    ),
});

export const refreshValidations = joi.object().keys({
  refreshToken: joi.string().required(),
});

export const editUserProfileValidations = joi.object().keys({
  username: joi.string().required().max(15).trim(),
  phoneNumber: joi
    .string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .required(),
  fullName: joi.string().required().trim(),
  countryCode: joi.string().required(),
});
