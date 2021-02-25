import Joi from '@hapi/joi';
import * as customError from "../config/errorCodes" 

export const createEventSchema = Joi.object({
    begin_date: Joi.date()
            .required()
            .min("01.01.1900")
            .error(new Error(customError.startAfter1900)),
    end_date: Joi.date()
            .required()
            .min(Joi.ref('begin_date'))
            .error(new Error(customError.endBeforeStart)),
    title: Joi.string()
            .required()
            .min(3)
            .error(new Error(customError.invalidTitle)),
    daylong: Joi.boolean()
            .required()
            .error(new Error(customError.missingArgument)),
    description: Joi.string()
            .optional()
            .allow(null, ""),
    color: Joi.number()
            .min(4278190080)
            .max(4294967295)
            .error(new Error(customError.invalidColor)),
    pinned_note: Joi.number()
            .optional()
            .allow(null),
            
});

export const editEventSchema = Joi.object({
        begin_date: Joi.date()
                .min("01.01.1900")
                .error(new Error(customError.startAfter1900)),
        end_date: Joi.date()
                .min(Joi.ref('begin_date'))
                .error(new Error(customError.endBeforeStart)),
        title: Joi.string()
                .min(3)
                .error(new Error(customError.invalidTitle)),
        description: Joi.string()
                .optional()
                .allow(null, ""),
        daylong: Joi.boolean(),
        color: Joi.number()
                .min(4278190080)
                .max(4294967295)
                .error(new Error(customError.invalidColor)),
        pinned_note: Joi.number()
                .optional()
                .allow(null),
    });