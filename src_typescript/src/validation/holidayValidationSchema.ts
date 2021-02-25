import Joi from '@hapi/joi';
import { StateCode } from '../controllers/holidayController';

export const getHolidaysSchema = Joi.object({
    year:
        Joi.number()
        .required()
        .min(2000)
        .max(3000)
        .error(new Error("Year must be between 2000 and 3000")),
    stateCode:
        Joi.string()
        .required()
        .valid("BW","BY","BE","BB","HB","HH","HE","MV","NI","NW","RP","SL","SN","ST","SH","TH")
        .min(2)
        .max(2)
        .error(new Error("StateCode must be one of the following codes: BW, BY, BE, BB, HB, HH, HE, MV, NI, NW, RP, SL, SN, ST, SH, TH")),
});