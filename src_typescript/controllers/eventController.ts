import { Request, Response } from "express";
import Sequelize  from "sequelize";

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes"

import { LocalPayloadInterface, CreateEventInterface, EditEventInterface } from "../validation/interfaces"
import { createEventSchema, editEventSchema } from "../validation/eventValidationSchemas";

import { EventModel } from "../models/Event";

import CalendarController from "./calendarController"
import { NoteModel } from "../models/Notes";

class EventController {
    //GET Event Info (JWT)
    public static async getEventInfo(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get calendar_id and event_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_event_id = request.params.event_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        //find event in database
        const response_event_attr = ['event_id', 'title', 'description', "begin_date", 'end_date', 'creation_date', 'color', 'created_by_user', 'daylong', 'pinned_note'];

        try{
            //get event where event_id and associated_calendar are matching the request
            const event: (EventModel | null) = await EventModel.findOne({
                attributes: response_event_attr, 
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {event_id: requested_event_id}
                    ]
                },
            });

            if(!event) return response.status(404).json(toObj(response, {Error: customError.eventNotFound}));

            response.status(200).json(toObj(response,{Event: event}));
        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }

    //POST create Event (JWT, >= verified)
    public static async createEvent(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: CreateEventInterface = request.body;
    
        const { error } = createEventSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.can_create_events) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        let event = new EventModel();

        event.color = requestParams.color;
        event.begin_date = requestParams.begin_date;
        event.end_date = requestParams.end_date;
        event.daylong = requestParams.daylong;

        event.title = requestParams.title;

        if(requestParams.description)
            event.description = requestParams.description;

        if(requestParams.pinned_note) {
            const note: (NoteModel | null) = await NoteModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {note_id: requestParams.pinned_note}
                    ]
                }
            });

            if(!note) return response.status(404).json(toObj(response, {Error: customError.noteNotFound}));

            event.pinned_note = requestParams.pinned_note;
        }

        event.associated_calendar = requested_calendar_id;
        event.created_by_user = userPayload.user_id;


        await event.save()
            .then((newEvent: EventModel) => {
                return response.status(201).json(toObj(response,{ event_id: newEvent.event_id }));
            })
            .catch((err: Error) => {console.error(err); return response.status(500).json(toObj(response));});
    }

    //PATCH edit Event (JWT, >= verified)
    public static async editEvent(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: EditEventInterface = request.body;
    
        const { error } = editEventSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        //get calendar_id and event_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_event_id = request.params.event_id;

        try{
            //Get event from database
            let event: (EventModel | null) = await EventModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {event_id: requested_event_id}
                    ]
                },
            })
            if(!event) return response.status(404).json(toObj(response, {Error: customError.eventNotFound}));

            //get all associated users form the calendar
            const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
            if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
            if(userPayload.user_id != event.created_by_user){
                if(!isMember.can_edit_events) {
                    return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
                }
            }

            let countChanges: number = 0;

            //change data 
            if(event.begin_date != requestParams.begin_date && requestParams.begin_date){
                event.begin_date = requestParams.begin_date
                countChanges++;
            }

            if(event.end_date != requestParams.end_date && requestParams.end_date){
                event.end_date = requestParams.end_date
                countChanges++;
            }

            if(event.title != requestParams.title && requestParams.title){
                event.title = requestParams.title
                countChanges++;
            }

            if(event.description != requestParams.description){
                if(requestParams.description == null) {
                    event.description = "";
                } else {
                    event.description = requestParams.description
                }
                countChanges++;
            }

            if(event.daylong != requestParams.daylong && requestParams.daylong != undefined){
                event.daylong = requestParams.daylong
                countChanges++;
            }
        
            if(event.color != requestParams.color && requestParams.color != undefined){
                event.color = requestParams.color;
                countChanges++;
            }

            if(requestParams.pinned_note == null) {
                event.pinned_note = null;
            }

            if(event.pinned_note != requestParams.pinned_note && requestParams.pinned_note){
                const note: (NoteModel | null) = await NoteModel.findOne({
                    where: {
                        [Sequelize.Op.and]: [
                            {associated_calendar: requested_calendar_id}, 
                            {note_id: requestParams.pinned_note}
                        ]
                    }
                });
    
                if(!note) return response.status(404).json(toObj(response, {Error: customError.noteNotFound}));
    
                event.pinned_note = requestParams.pinned_note;
                countChanges++;
            }

            //save calendar
            event.save()
                .then(() => {
                    return response.status(200).json(toObj(response,{Info: "Event successfully updated",Changes: countChanges}));
                })
        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }

    //DELETE delete Event (JWT)
    public static async deleteEvent(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }
    
        //get calendar_id and event_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_event_id = request.params.event_id;
 
        try{
            //Get event from database
            let event: (EventModel | null) = await EventModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {event_id: requested_event_id}
                    ]
                },
            })
            if(!event) return response.status(404).json(toObj(response, {Error: customError.eventNotFound}));

            //get all associated users form the calendar
            const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
            if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
            if(userPayload.user_id != event.created_by_user){
                if(!isMember.can_edit_events) {
                    return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
                }
            }

            await event.destroy();

            return response.status(200).json(toObj(response,{Info: "Event deleted"}));

        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }
}

export default EventController;