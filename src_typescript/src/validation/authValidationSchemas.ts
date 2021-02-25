import Joi from '@hapi/joi';
import * as customError from "../config/errorCodes" 

export const registerUserSchema = Joi.object({
    name:  
        Joi.string()
        .required()
        .min(3)
        .error(new Error(customError.shortName)),
    email: 
        Joi.string()
        .required()
        .email()
        .error(new Error(customError.invalidEmail)),
    birthday:
        Joi.date()
        .default(null)
        .error(new Error(customError.invalidDate)),
})

export const loginUserSchema = Joi.object({
    email: Joi.string()
            .required()
            .email()
            .error(new Error(customError.invalidEmail)), 
    password: Joi.string()
            .required()
            .error(new Error(customError.missingArgument)), 
});

export const changePasswordSchema = Joi.object({
    old_password: 
        Joi.string()
        .required()
        .error(new Error(customError.missingArgument)), 
    new_password: 
        Joi.string()
        .min(8)
        .required()
        .error(new Error(customError.shortPassword)),
    repeat_password: 
        Joi.string()
        .required()
        .valid(Joi.ref('new_password'))
        .error(new Error(customError.repeatNotMatch)), 
});

export const validateEmailSchema = Joi.object({
    validation_key: 
        Joi.string()
        .required()
        .error(new Error(customError.missingArgument)),
    password: 
        Joi.string()
        .min(8)
        .required()
        .error(new Error(customError.shortPassword)),
    repeat_password: 
        Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .error(new Error(customError.repeatNotMatch)), 
});

export const resetPasswordSchema = Joi.object({
    recovery_key: 
        Joi.string()
        .required()
        .error(new Error(customError.missingArgument)),
    new_password: 
        Joi.string()
        .min(8)
        .required()
        .error(new Error(customError.shortPassword)),
    repeat_password: 
        Joi.string()
        .required()
        .valid(Joi.ref('new_password'))
        .error(new Error(customError.repeatNotMatch)), 
});