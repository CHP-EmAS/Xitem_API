import { Request, Response } from "express";
import Sequelize  from "sequelize";

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes"

import { LocalPayloadInterface, CreateNoteInterface, EditNoteInterface } from "../validation/interfaces"
import { createNoteSchema, editNoteSchema } from "../validation/noteValidationSchemas";

import CalendarController from "./calendarController"

import { NoteModel } from "../models/Notes";

class NoteController {

    //GET Note Info (JWT)
    public static async getNoteInfo(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get calendar_id and note_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_note_id = request.params.note_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        const response_note_attr = ['note_id', 'title', 'content', "color", 'pinned', 'associated_calendar', 'owner_id', 'creation_date', 'modification_date'];

        try{
            //get note where note_id and associated_calendar are matching the request
            const note: (NoteModel | null) = await NoteModel.findOne({
                attributes: response_note_attr, 
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {note_id: requested_note_id}
                    ]
                }
            });

            if(!note) return response.status(404).json(toObj(response, {Error: customError.noteNotFound}));

            response.status(200).json(toObj(response,{Note: note}));
        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }

    //GET all notes Info (JWT)
    public static async getAllNotesInfo(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get calendar_id and note_id given in path
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        const response_note_attr = ['note_id', 'title', 'content', "color", 'pinned', 'associated_calendar', 'owner_id', 'creation_date', 'modification_date'];

        try{
            //get notes where associated_calendar is matching the request
            const notes: Array<NoteModel> = await NoteModel.findAll({
                attributes: response_note_attr, 
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                    ]
                }
            });

            response.status(200).json(toObj(response,{Notes: notes}));
        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }

    //POST create Note (JWT, >= verified)
    public static async createNote(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: CreateNoteInterface = request.body;
    
        const { error } = createNoteSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.can_create_events) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        let note = new NoteModel();

        note.title = requestParams.title;
        note.content = requestParams.content;
       
        note.associated_calendar = requested_calendar_id;
        note.owner_id = userPayload.user_id;

        note.color = requestParams.color;
        note.pinned = requestParams.pinned;

        await note.save()
            .then((newNote: NoteModel) => {
                return response.status(201).json(toObj(response,{ note_id: newNote.note_id }));
            })
            .catch((err: Error) => {console.error(err); return response.status(500).json(toObj(response));});
    }

    //PATCH edit Note (JWT, >= verified)
    public static async editNote(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: EditNoteInterface = request.body;
    
        const { error } = editNoteSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        //get calendar_id and note_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_note_id = request.params.note_id;

        try{
            //Get note from database
            let note: (NoteModel | null) = await NoteModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {note_id: requested_note_id}
                    ]
                },
            })
            if(!note) return response.status(404).json(toObj(response, {Error: customError.noteNotFound}));

            //get all associated users form the calendar
            const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
            if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
            if(userPayload.user_id != note.owner_id){
                if(!isMember.can_edit_events) {
                    return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
                }
            }

            let countChanges: number = 0;

            //change data 
            if(note.title != requestParams.title && requestParams.title){
                note.title = requestParams.title
                countChanges++;
            }

            if(note.content != requestParams.content && requestParams.content){
                note.content = requestParams.content
                countChanges++;
            }

            if(requestParams.pinned != undefined) {
                if(note.pinned != requestParams.pinned){
                    note.pinned = requestParams.pinned
                    countChanges++;
                }
            }
           
            if(note.color != requestParams.color && requestParams.color){
                note.color = requestParams.color
                countChanges++;
            }

            //save calendar
            note.save()
                .then((editNote: NoteModel) => {
                    return response.status(200).json(toObj(response,{Info: "Note succesfully updated",Changes: countChanges}));
                })
        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }

    //DELETE delete Note (JWT)
    public static async deleteNote(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }
    
        //get calendar_id and note_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_note_id = request.params.note_id;
 
        try{
            //Get note from database
            let note: (NoteModel | null) = await NoteModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {associated_calendar: requested_calendar_id}, 
                        {note_id: requested_note_id}
                    ]
                },
            })
            if(!note) return response.status(404).json(toObj(response, {Error: customError.noteNotFound}));

            //get all associated users form the calendar
            const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
            if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
            if(userPayload.user_id != note.owner_id){
                if(!isMember.can_edit_events) {
                    return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
                }
            }

            note.destroy();

            return response.status(200).json(toObj(response,{Info: "Note deleted"}));

        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }
}

export default NoteController;