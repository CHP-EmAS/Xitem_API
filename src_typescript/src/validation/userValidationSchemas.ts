import Joi, { required } from '@hapi/joi';
import * as customError from "../config/errorCodes" 

export const patchUserSchema = Joi.object({
    name:  
        Joi.string()
        .min(3)
        .error(new Error(customError.shortName)),
    birthday:
        Joi.date()
        .allow(null)
        .error(new Error(customError.invalidDate)),
});

export const accountDeletionSchema = Joi.object({
    deletion_key:  
        Joi.string()
        .required()
        .error(new Error(customError.missingArgument)),
    password:
        Joi.string()
        .required()
        .error(new Error(customError.missingArgument)),
});