import { Request, Response } from "express";
import Sequelize  from "sequelize";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes"

import { LocalPayloadInterface, CreateCalendarInterface, AssociatedUserInterface, EditCalendarInterface, PatchAssociatedUserInterface, PatchCalendarLayoutInterface, AddAssociatedUserInterface, AssociatedCalendarInterface, GenerateInvitationTokenInterface, JWTCalendarInvitationInterface, VerifyInvitationInterface } from "../validation/interfaces"
import { createCalendarSchema, editCalendarSchema, addAssociatedUserSchema, patchAssociatedUserSchema, patchCalendarLayoutSchema, generateInvitationTokenSchema, verifyInvitationSchema } from "../validation/calendarValidationSchemas";

import { CalendarModel } from "../models/Calendar";
import { CalendarUserLinkModel } from "../models/Calendar_User_lnk";

class CalendarController {

    //#############  Calendar Functions #############//

    //GET Calendar Info (JWT)
    public static async getCalendarInfo(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get calendar_id given in path
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        //find calendar in database
        const response_calendar_attr = ['calendar_id', 'calendar_name', 'can_join', 'raw_color_legend', 'creation_date'];

        try{
            const calendar: CalendarUserLinkModel | null = await CalendarUserLinkModel.findOne({ 
                where: { 
                    [Sequelize.Op.and]: [
                        {calendar_id: requested_calendar_id}, 
                        {user_id: userPayload.user_id}
                    ]
                },
                include: [{
                    model: CalendarModel, 
                    as: 'calendarObject',
                    attributes: response_calendar_attr,
                }]
            });

            if(!calendar) return response.status(404).json(toObj(response, {Error: customError.calendarNotFound}));
            
            let newAssociatedCalendar: AssociatedCalendarInterface = {
                calendarObject: calendar.calendarObject, 
                is_owner: calendar.is_owner, 
                can_create_events: calendar.can_create_events, 
                can_edit_events: calendar.can_edit_events,
                color: calendar.color,
                icon: calendar.icon
            };

            response.status(200).json(toObj(response,{Calendar: newAssociatedCalendar}));
        } catch {
            response.status(500).json(toObj(response));
        }
    }

    //POST create Calendar (JWT, >= verified)
    public static async createCalendar(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: CreateCalendarInterface = request.body;
    
        const { error } = createCalendarSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        const fullCalendarName: (string | null) = await CalendarController.createCalendarName(requestParams.title);
        if(!fullCalendarName) return response.status(500).json(toObj(response));

        let calendar = new CalendarModel();

        calendar.calendar_id = uuidv4();
        calendar.calendar_name = fullCalendarName;
        calendar.can_join = requestParams.can_join;
        calendar.raw_color_legend = "{}"
        calendar.hashPassword(requestParams.password);
    
        try {
            const newCalendar: CalendarModel = await calendar.save();

            let calendarUserLink = new CalendarUserLinkModel({
                calendar_id: newCalendar.calendar_id,
                user_id: userPayload.user_id, 
                is_owner: true, 
                can_create_events: true, 
                can_edit_events: true,
            });

            if(requestParams.color) {
                calendarUserLink.color = requestParams.color;
            }

            if(requestParams.icon) {
                calendarUserLink.icon = requestParams.icon;
            }

            await calendarUserLink.save()
                .catch((err: Error) => {
                    console.error(err); 
                    newCalendar.destroy();
                    return response.status(500).json(toObj(response))
                });

            console.log("User " + userPayload.name + "<" + userPayload.user_id + "> created new Calendar: '" + newCalendar.calendar_name + "' with ID " + newCalendar.calendar_id);
            return response.status(201).json(toObj(response,{ calendar_id: newCalendar.calendar_id }));

        } catch ( error ) {
            console.error(error);
            return response.status(500).json(toObj(response));
        }
    }

    //PATCH edit Calendar (JWT, >= verified)
    public static async editCalendar(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: EditCalendarInterface = request.body;
    
        const { error } = editCalendarSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        //get and validate calendar_id given in path
        const calendar_to_patch = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(calendar_to_patch, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.is_owner) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
        
        //Get calendar from database
        let calendar: (CalendarModel | null) = await CalendarModel.findByPk(calendar_to_patch);
        if(!calendar) return response.status(404).json(toObj(response, {Error: customError.calendarNotFound}));

        //split calendarID
        const split: ({name: string, hash: number} | null) = CalendarController.divideCalendarName(calendar.calendar_name)
        if(!split) return response.status(500).json(toObj(response));

        try {
            //change data 
            if(split.name != requestParams.title && requestParams.title){

                const fullCalendarName: (string | null) = await CalendarController.createCalendarName(requestParams.title);
                if(!fullCalendarName) return response.status(500).json(toObj(response));

                calendar.calendar_name = fullCalendarName;
            }

            if(requestParams.can_join != undefined) {
                calendar.can_join = requestParams.can_join;
            }

            if(requestParams.raw_color_legend != undefined) {
                try {
                    JSON.parse(requestParams.raw_color_legend);
                } catch (e) {
                    return response.status(400).json(toObj(response, {Error: customError.invalidJson}));
                }

                calendar.raw_color_legend = requestParams.raw_color_legend;
            }

            if(requestParams.password != undefined) {
                calendar.hashPassword(requestParams.password);
            }
            
            //save calendar
            await calendar.save()
                .then(() => {
                    return response.status(200).json(toObj(response,{Info: "Calendar succesfully updated"}));
                })
        } catch( error ) {
            console.log(error); 
            return response.status(500).json(toObj(response));
        }
    }

    //DELETE delete Calendar (JWT)
    public static async deleteCalendar(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }
    
        //get calendar_id given in path
        const calendar_to_delete = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(calendar_to_delete, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.is_owner) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        try {
            const calendar: CalendarModel | null = await CalendarModel.findByPk(calendar_to_delete);
            if(!calendar) return response.status(404).json(toObj(response, {Error: customError.calendarNotFound}));

            await calendar.destroy();

            return response.status(200).json(toObj(response,{Info: "Calendar deleted"}));

        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }

    //############# Associated User Functions #############//

    //GET all associated users (JWT)
    public static async getAllAssociatedUsers(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get calendar_id given in path
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        //find associated users in database
        const associatedUsers = await CalendarController.associatedUsers(requested_calendar_id)
        if(!associatedUsers) return response.status(404).json(toObj(response, {Error: customError.memberNotFound}));
        
        return response.status(200).json(toObj(response,{associated_users: associatedUsers}));
    }

    //GET associated user (JWT)
    public static async getAssociatedUser(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get calendar_id and user_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_user_id = request.params.user_id

        //check if requesting user is member of the requested calendar instance
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        //get associated user form the calendar
        const assocUser = await CalendarController.isCalendarMember(requested_calendar_id, requested_user_id);
        if(assocUser == null) return response.status(404).json(toObj(response, {Error: customError.memberNotFound}));

        return response.status(200).json(toObj(response,{associated_user: assocUser}));
    }

    //Patch update associated user (JWT, >= verified) 
    public static async patchAssociatedUser(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get request params
        const requestParams: PatchAssociatedUserInterface = request.body;
    
        const validRequest = patchAssociatedUserSchema.validate(requestParams);
        if(validRequest.error) return response.status(400).json(toObj(response,{Error: validRequest.error.message}));

        //get calendar_id and user_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_user_id = request.params.user_id

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.is_owner) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
        
        try {
            //get associated user form the calendar
            const associatedUser = await CalendarUserLinkModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {calendar_id: requested_calendar_id}, 
                        {user_id: requested_user_id}
                    ]
                }
            });
            if(associatedUser == null) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));

            let countChanges: number = 0;

            //change data 
            if(associatedUser.is_owner != requestParams.is_owner && requestParams.is_owner != undefined){

                if(!requestParams.is_owner) {
                    //find associated users in database
                    const memberList = await CalendarController.associatedUsers(requested_calendar_id)
                    if(!memberList) return response.status(404).json(toObj(response, {Error: customError.memberNotFound}));
        
                    let owners: number = 0;
        
                    memberList.forEach(user => {
                        if(user.is_owner) owners++;
                    });
        
                    if(owners <= 1) {
                        return response.status(400).json(toObj(response, {Error: customError.lastOwner}));
                    }
                }

                associatedUser.is_owner = requestParams.is_owner;
                countChanges++;
            }
            
            if(associatedUser.can_create_events != requestParams.can_create_events && requestParams.can_create_events != undefined){
                associatedUser.can_create_events = requestParams.can_create_events;
                countChanges++;
            }
            if(associatedUser.can_edit_events != requestParams.can_edit_events && requestParams.can_edit_events != undefined){
                associatedUser.can_edit_events = requestParams.can_edit_events;
                countChanges++;
            }

            //save associated user
            await associatedUser.save()
            return response.status(200).json(toObj(response,{Info: "Associated user was successfully edited",Changes: countChanges}));
        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }

    public static async patchCalendarLayout(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get request params
        const requestParams: PatchCalendarLayoutInterface = request.body;
    
        const validRequest = patchCalendarLayoutSchema.validate(requestParams);
        if(validRequest.error) return response.status(400).json(toObj(response,{Error: validRequest.error.message}));

        //get calendar_id and user_id given in path
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        try {
            //get associated user form the calendar
            const associatedUser = await CalendarUserLinkModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {calendar_id: requested_calendar_id}, 
                        {user_id: userPayload.user_id}
                    ]
                }
            });
            if(associatedUser == null) return response.status(404).json(toObj(response, {Error: customError.memberNotFound}));

            //change data 
            associatedUser.color = requestParams.color;
            associatedUser.icon = requestParams.icon;

            //save associated user
            await associatedUser.save()
            return response.status(200).json(toObj(response,{Info: "Layout was successfully edited"}));
        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }

    //POST add associated user (JWT, >= verified) 
    public static async addAssociatedUser(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get request params
        const requestParams: AddAssociatedUserInterface = request.body;
    
        const validRequest = addAssociatedUserSchema.validate(requestParams);
        if(validRequest.error) return response.status(400).json(toObj(response,{Error: validRequest.error.message}));

        //get calendar_hash_name given in path
        const requested_calendar_hash_name = request.params.calendar_name;
        
        try {
            const calendar: (CalendarModel | null) = await CalendarModel.findOne({where: {calendar_name: requested_calendar_hash_name}});
            if(!calendar) return response.status(404).json(toObj(response, {Error: customError.calendarNotFound}));

            //get all associated users form the calendar
            const isMember = await CalendarController.isCalendarMember(calendar.calendar_id, userPayload.user_id);
            if(isMember) return response.status(400).json(toObj(response, {Error: customError.assocUserAlreadyExists}));

            if(!calendar.can_join) return response.status(403).json(toObj(response, {Error: customError.calendarNotJoinable}));

            const validPass = calendar.checkIfUnencryptedPasswordIsValid(requestParams.password);
            if(!validPass) return response.status(401).json(toObj(response, {Error: customError.wrongPassword}));

            let associatedUser: CalendarUserLinkModel = new CalendarUserLinkModel();

            associatedUser.calendar_id = calendar.calendar_id;
            associatedUser.user_id = userPayload.user_id;
            associatedUser.is_owner = false;
            associatedUser.can_create_events = true;
            associatedUser.can_edit_events = false;

            if(requestParams.color) 
                associatedUser.color = requestParams.color;
            
            if(requestParams.icon) 
                associatedUser.icon = requestParams.icon;

            //save associated user
            await associatedUser.save()
            console.log("User " + userPayload.name + "<" + userPayload.user_id + "> is now member of Calendar " + calendar.calendar_id)
            return response.status(201).json(toObj(response,{calendar_id: calendar.calendar_id}));
        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }

    //DELETE remove associated user (JWT)
    public static async removeAssociatedUser(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }
    
        //get calendar_id and user_id given in path
        const requested_calendar_id = request.params.calendar_id;
        const requested_user_id = request.params.user_id

        //check if requesting user is owner of the requested calendar instance
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        if(!isMember.is_owner) {
            if(userPayload.user_id != requested_user_id) {
                return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
            }
        }

        //find associated users in database
        const associatedUsers = await CalendarController.associatedUsers(requested_calendar_id)
        if(!associatedUsers) return response.status(404).json(toObj(response, {Error: customError.memberNotFound}));

        if(associatedUsers.length <= 1) {
            return response.status(400).json(toObj(response, {Error: customError.lastMember}));
        } else if(isMember.is_owner) {

            let owners: number = 0;

            associatedUsers.forEach(user => {
                if(user.is_owner) owners++;
            });

            if(owners <= 1) {
                return response.status(400).json(toObj(response, {Error: customError.lastOwner}));
            }
        }
         
        try {
            const link: CalendarUserLinkModel | null = await CalendarUserLinkModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {calendar_id: requested_calendar_id}, 
                        {user_id: requested_user_id}
                    ]
                }
            });
            if(!link) return response.status(404).json(toObj(response, {Error: customError.memberNotFound}));
            
            await link.destroy();

            return response.status(200).json(toObj(response,{Info: "User was removed from calendar"}));

        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }

    //############# Calendar Invitation ###############//

    public static async generateInvitationToken(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: GenerateInvitationTokenInterface = request.body;
    
        const { error } = generateInvitationTokenSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        //get and validate calendar_id given in path
        const invitation_calendar = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(invitation_calendar, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.is_owner) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
        
        let payload: JWTCalendarInvitationInterface = {calendar_id: invitation_calendar, can_create_events: requestParams.can_create_events, can_edit_events: requestParams.can_edit_events};
        const expireTime: string = String(requestParams.expire) + "m";
    
        try {

            const token = jwt.sign(payload,<jwt.Secret>(process.env.JWT_INVITATION_SECRET), {
                expiresIn: expireTime,
            });

            return response.status(200).json(toObj(response,{Token: token}));

        } catch ( error ) {

            console.error(error);
            return response.status(500).json(toObj(response));

        }
    }

    public static async verifyInvitationToken(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: VerifyInvitationInterface = request.body;
    
        const { error } = verifyInvitationSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        //Try to validate the token
        try {

            //verify
            const verifiedPayload: JWTCalendarInvitationInterface = <JWTCalendarInvitationInterface>jwt.verify(requestParams.invitation_token, <jwt.Secret>(process.env.JWT_INVITATION_SECRET));
    
            //check if iat and exp is specified in token
            const jwt_iat = verifiedPayload.iat;
            const jwt_exp = verifiedPayload.exp;
    
            if(!jwt_iat || !jwt_exp) {
                console.info("Invitation token from User " + userPayload.name + "(" + userPayload.user_id + ") could not be verified because parameter iat or exp is missing in payload")
                return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
            }

            const invitation_calendar = verifiedPayload.calendar_id;

            const calendar: (CalendarModel | null) = await CalendarModel.findByPk(invitation_calendar);
            if(!calendar) {
                return response.status(404).json(toObj(response, {Error: customError.calendarNotFound}));
            }

            //get all associated users form the calendar
            const isMember = await CalendarController.isCalendarMember(calendar.calendar_id, userPayload.user_id);
            if(isMember) return response.status(400).json(toObj(response, {Error: customError.assocUserAlreadyExists}));

            if(!calendar.can_join) return response.status(403).json(toObj(response, {Error: customError.calendarNotJoinable}));
  
            let associatedUser: CalendarUserLinkModel = new CalendarUserLinkModel();

            associatedUser.calendar_id = calendar.calendar_id;
            associatedUser.user_id = userPayload.user_id;
            associatedUser.is_owner = false;
            associatedUser.can_create_events = verifiedPayload.can_create_events;
            associatedUser.can_edit_events = verifiedPayload.can_edit_events;

            if(requestParams.color) 
                associatedUser.color = requestParams.color;
            
            if(requestParams.icon) 
                associatedUser.icon = requestParams.icon;

            //save associated user
            await associatedUser.save()
            console.log("User " + userPayload.name + "<" + userPayload.user_id + "> is now member of Calendar " + calendar.calendar_id + " (Invitation-Token)")
            return response.status(201).json(toObj(response,{calendar_id: calendar.calendar_id}));

        } catch ( error: unknown ) {

            if(error instanceof jwt.TokenExpiredError) {
                return response.status(400).json(toObj(response,{Error: customError.expiredToken}));
            }

            console.warn("Unknown error when verifying a jwt invitation payload!")
            console.error(error)
            return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
        }

    }

    //############# Public Functions #############//

    public static async isCalendarMember(calendar_id: string, user_id: string): Promise<AssociatedUserInterface | null> {
        const response_calendar_attr = ['calendar_id', 'user_id', 'is_owner', 'can_create_events', 'can_edit_events'];

        try {
            //get all associated users form the calendar
            return await CalendarUserLinkModel.findOne({
                attributes: response_calendar_attr,
                where: {
                    [Sequelize.Op.and]: [
                        {calendar_id: calendar_id}, 
                        {user_id: user_id}
                    ]
                }
            });
        } catch ( error ) {
            console.log(error);
            return null;
        }
    }

    public static divideCalendarName(calendar_name: string): ({name: string, hash: number} | null) {

        if(!calendar_name.includes("#")) {
            console.error("CalendarController: Cannot split CalendarID: <" + calendar_name + ">");
            return null;
        }

        let dividedName = calendar_name.split("#");

        let hash: (number | undefined) = undefined;
        let name: (string | undefined) = undefined;

        if(dividedName.length == 2) {
            name = dividedName[0]
            hash = Number(dividedName[1]);
        } else {
            console.error("CalendarController: Cannot split Calendar-Name: <" + calendar_name + ">! dividedID.length() != 2");
            return null;
        }

        if(hash == undefined || name == undefined) {
            console.log(name)
            console.log(hash)
            console.error("CalendarController: Cannot split Calendar-Name: <" + calendar_name + ">! hash or name null");
            return null;
        } else {
            return {name , hash}
        }

    }

    //############# Private Functions #############//
    private static async associatedUsers(calendar_id: string): Promise<AssociatedUserInterface[] | null> {
        try {
            const users: Array<CalendarUserLinkModel> | null = await CalendarUserLinkModel.findAll({ where: { calendar_id: calendar_id }});

            if(!users) return null;

            let responseList = new Array<AssociatedUserInterface>();

            users.forEach( (listObject) => {
                
                const newAssociatedUser: AssociatedUserInterface = {
                    user_id: listObject.user_id, 
                    is_owner: listObject.is_owner, 
                    can_create_events: listObject.can_create_events, 
                    can_edit_events: listObject.can_edit_events
                };

                responseList.push(newAssociatedUser);
            });

            return responseList;
        } catch ( error ) {
            console.error(error);
            return null;
        }
    }

    private static async createCalendarName(calendar_name: string): Promise<string | null> {
        try {
            const latest_calendar_name: (string | null) = await CalendarModel.max( 'calendar_name',{ 
                where: {
                    calendar_name: {[Sequelize.Op.iLike]: calendar_name + "#%" }
                }
            });

            let str_hash = "0001";

            if(latest_calendar_name) {
                const split: ({name: string, hash: number} | null) = CalendarController.divideCalendarName(latest_calendar_name)
                if(!split) return null;

                const new_id = split.hash + 1;

                if(new_id > 999) str_hash = new_id.toString()
                else if(new_id > 99) str_hash = "0" + new_id.toString()
                else if(new_id > 9) str_hash = "00" + new_id.toString()
                else if(new_id >= 0) str_hash = "000" + new_id.toString()
                else return null;
            }

            return calendar_name + "#" + str_hash;
        } catch ( error ) {
            console.error(error);
            return null;
        }
    }
}

export default CalendarController;