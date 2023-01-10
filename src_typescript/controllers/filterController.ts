import { Request, Response } from "express";
import { Op } from "sequelize";

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes"

import { LocalPayloadInterface, GetEventPeriodInterface} from "../validation/interfaces"
import { editEventSchema } from "../validation/eventValidationSchemas";
import { EventModel } from "../models/Event";

import CalendarController from "../controllers/calendarController"

class FilterController {

    //GET Event Info (JWT)
    public static async getEventsPeriod(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        if(!request.query.begin_date || !request.query.end_date) {
            return response.status(400).json(toObj(response,{Error: customError.missingArgument}));
        }

        const requestParams: GetEventPeriodInterface = {begin_date: new Date(request.query.begin_date.toString()), end_date: new Date(request.query.end_date.toString())};
    
        const { error } = editEventSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.toString()}));

        //get calendar_id and event_id given in path
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        //find event in database
        const response_event_attr = ['event_id', 'title', 'description', 'begin_date', 'end_date', 'creation_date', 'color', 'created_by_user', 'daylong', 'pinned_note'];
        
        try{
            //get event where event_id and associated_calendar are matching the request
            const events: (EventModel[] | null) = await EventModel.findAll({
                attributes: response_event_attr, 
                where: {
                    associated_calendar: requested_calendar_id,
                    [Op.or]: [
                        {
                            begin_date: {
                                [Op.and]: {
                                    [Op.gte]: requestParams.begin_date.toUTCString(),
                                    [Op.lte]: requestParams.end_date.toUTCString(),
                                }
                            }
                        }, {
                            end_date: {
                                [Op.and]: {
                                    [Op.gte]: requestParams.begin_date.toUTCString(),
                                    [Op.lte]: requestParams.end_date.toUTCString(),
                                }
                            }
                        }, {
                            [Op.and]: [
                                {
                                    begin_date: {
                                        [Op.lte]: requestParams.begin_date.toUTCString()
                                    }
                                },{
                                    end_date: {
                                        [Op.gte]: requestParams.end_date.toUTCString()
                                    }
                                }
                            ]
                        }
                    ]
                }
            })

            if(!events) return response.status(404).json(toObj(response, {Error: customError.eventNotFound}));

            response.status(200).json(toObj(response,{Events: events}));
        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }
}

export default FilterController;