import Joi from 'joi';
import * as customError from "../config/errorCodes" 

export const createCalendarSchema = Joi.object({
        title: Joi.string()
            .required()
            .regex(/^[^#]*$/i) //disallow #
            .error(new Error(customError.invalidTitle)), 
        password: Joi.string()
            .required()
            .min(6)
            .error(new Error(customError.shortPassword)),
        can_join: Joi.boolean()
            .required()
            .error(new Error(customError.missingArgument)),
        color: Joi.number()
            .optional()
            .min(0)
            .max(50)
            .error(new Error(customError.invalidColor)),
        icon: Joi.number()
            .optional()
});

export const editCalendarSchema = Joi.object({
        title: Joi.string()
            .regex(/^[^#]*$/i) //disallow #
            .error(new Error(customError.invalidTitle)), 
        can_join: Joi.boolean(),
        password: Joi.string()
            .optional()
            .min(6)
            .error(new Error(customError.shortPassword)),
});

export const patchAssociatedUserSchema = Joi.object({
        is_owner: Joi.boolean(),
        can_create_events: Joi.boolean(),
        can_edit_events: Joi.boolean()
});

export const patchCalendarLayoutSchema = Joi.object({
        color: Joi.number()
            .required()
            .min(0)
            .max(50)
            .error(new Error(customError.invalidColor)),
        icon: Joi.number()
            .required()
            .error(new Error(customError.missingArgument)),
});

export const addAssociatedUserSchema = Joi.object({
        password: Joi.string()
            .required()
            .error(new Error(customError.missingArgument)),
        color: Joi.number()
            .optional()
            .min(0)
            .max(50)
            .error(new Error(customError.invalidColor)),
        icon: Joi.number()
            .optional()
});

export const generateInvitationTokenSchema = Joi.object({
    can_create_events: Joi.boolean()
        .required()
        .error(new Error(customError.missingArgument)),
    can_edit_events: Joi.boolean()
        .required()
        .error(new Error(customError.missingArgument)),
    expire: Joi.number()
        .required()
        .min(5)
        .max(10080)
        .error(new Error(customError.invalidNumber)),
});

export const verifyInvitationSchema = Joi.object({
    invitation_token: Joi.string()
        .required()
        .error(new Error(customError.missingArgument)),
    color: Joi.number()
        .optional()
        .min(0)
        .max(50)
        .error(new Error(customError.invalidColor)),
    icon: Joi.number()
        .optional()
});