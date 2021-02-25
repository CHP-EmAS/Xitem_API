import Joi from '@hapi/joi';

export const filterUserSchema = Joi.object({
    search:
        Joi.string()
        .min(1)
        .required()
        .error(new Error("Search string must consist of at least 1 characters.")),
    limit:
        Joi.number()
        .min(1)
        .max(50)
        .required()
        .error(new Error("Limit must be a number between 0 and 51.")),
});