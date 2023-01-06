import { Request, Response, NextFunction } from "express";

import toObj from "../config/responseStandart"

import { isValidUUID, isValidIntegerID } from "../validation/standartSchemas";

export const validatePathParameter = async (request: Request, response: Response, next: NextFunction) => {
    const path_user_id = request.params.user_id

    if(path_user_id != undefined) {
        const { error } = isValidUUID.validate({id: path_user_id});
        if(error) return response.status(400).json(toObj(response,{Error: "Given User ID must be a valid UUID"}));
    }

    const path_calendar_id = request.params.calendar_id

    if(path_calendar_id != undefined) {
        const { error } = isValidUUID.validate({id: path_calendar_id});
        if(error) return response.status(400).json(toObj(response,{Error:"Given Calendar ID must be a valid UUID"}));
    }

    const path_event_id = request.params.event_id

    if(path_event_id != undefined) {
        const { error } = isValidIntegerID.validate({id: path_event_id});
        if(error) return response.status(400).json(toObj(response,{Error: "Given Event ID must be a Number"}));
    }

    const path_voting_id = request.params.voting_id

    if(path_voting_id != undefined) {
        const { error } = isValidIntegerID.validate({id: path_voting_id});
        if(error) return response.status(400).json(toObj(response,{Error: "Given Voting ID must be a Number"}));
    }

    const path_choice_id = request.params.choice_id

    if(path_choice_id != undefined) {
        const { error } = isValidIntegerID.validate({id: path_choice_id});
        if(error) return response.status(400).json(toObj(response,{Error: "Given Choice ID must be a Number"}));
    }

    const path_note_id = request.params.note_id

    if(path_note_id != undefined) {
        const { error } = isValidIntegerID.validate({id: path_note_id});
        if(error) return response.status(400).json(toObj(response,{Error: "Given Note ID must be a Number"}));
    }
            
    next()
};
    