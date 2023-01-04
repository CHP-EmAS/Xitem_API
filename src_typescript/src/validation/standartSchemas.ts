import Joi from 'joi';

export const isValidUUID = Joi.object({
    id: Joi.string()
            .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
            .required(),
});

export const isValidIntegerID = Joi.object({
    id: Joi.number()
        .required()
        .min(0)
});

export const isValidEmailAddress = Joi.object({
    email: 
        Joi.string()
        .required()
        .email()
});
