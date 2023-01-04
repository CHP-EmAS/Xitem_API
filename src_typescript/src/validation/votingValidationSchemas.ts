import Joi from 'joi';
import * as customError from "../config/errorCodes" 

export const createVotingSchema = Joi.object({
    title: Joi.string()
            .required()
            .min(3)
            .error(new Error(customError.invalidTitle)),
    abstention_allowed: Joi.boolean()
            .required()
            .error(new Error(customError.missingArgument)),
    multiple_choice: Joi.boolean()
            .required()
            .error(new Error(customError.missingArgument)),
    choices: Joi.array()
            .items(
                Joi.object({
                    date: Joi.date()
                        .required()
                        .min("01.01.1900")
                        .error(new Error(customError.startAfter1900)),
                    comment: Joi.string()
                        .optional()
                        .allow(null, ""),
                })
            )
            .min(2)    
            .required()
            
});

export const voteSchema = Joi.object({
        choice_ids: Joi.array()
                .items(Joi.number())
                .min(1)
                .required()
                .error(new Error(customError.missingArgument)),
});