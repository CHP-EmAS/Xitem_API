import Joi from '@hapi/joi';
import * as customError from "../config/errorCodes" 

export const createNoteSchema = Joi.object({
    title: Joi.string()
            .required()
            .min(3)
            .error(new Error(customError.invalidTitle)),
    content: Joi.string()
            .required()
            .error(new Error(customError.missingArgument)),
    color: Joi.number()
            .required()
            .min(4278190080)
            .max(4294967295)
            .error(new Error(customError.invalidColor)),
    pinned: Joi.boolean()
            .required()
            
});

export const editNoteSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .error(new Error(customError.invalidTitle)),
    content: Joi.string(),
    color: Joi.number()
            .min(4278190080)
            .max(4294967295)
            .error(new Error(customError.invalidColor)),
    pinned: Joi.boolean()
});