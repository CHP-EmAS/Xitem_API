import { Request, Response } from "express";

import multer, {MulterError} from 'multer';
import path from 'path';
import * as filesystem from 'fs';
import jwt from "jsonwebtoken";

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes"

import { LocalPayloadInterface, EditUserInterface, AssociatedCalendarInterface, JWTAccountDeletionInterface, AccountDeletionInterface } from "../validation/interfaces"
import { accountDeletionSchema, patchUserSchema } from "../validation/userValidationSchemas";

import { UserModel } from "../models/User";
import { UserRoleModel } from "../models/UserRole"
import { CalendarUserLinkModel } from "../models/Calendar_User_lnk"
import { CalendarModel } from "../models/Calendar";
import { EventModel } from "../models/Event";
import { NoteModel } from "../models/Notes";
import MailController from "./mailController";

class UserController {

    //GET User Info (JWT)
    public static async getUserInfo(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get user_id given in path
        const requested_user_id = request.params.user_id

        //build user information array
        let response_user_attr: Array<string>;

        //find user in database
        if(requested_user_id == userPayload.user_id) response_user_attr = ['user_id','name','email','birthday','registered_at'];
        else response_user_attr = ['user_id','name','birthday']

        try{
            const user: (UserModel | null) = await UserModel.findOne({attributes: response_user_attr, where: {user_id: requested_user_id}, include: [{model: UserRoleModel, as: 'roleObject', attributes: [['full_name','role'],'description']}]});
            if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));
            response.status(200).json(toObj(response,{User: user.toJSON()}));
        } catch {
            response.status(500).json(toObj(response));
        }
    }

    //PATCH User (JWT)
    public static async patchUser(request: Request, response: Response) {
       //get and validate JWT Payload
       const userPayload: LocalPayloadInterface = response.locals.userPayload;

       if(!userPayload) {
           console.error("Controller Error: Missing userPayload");
           return response.status(500).json(toObj(response));
       }

       //Get and validate Body to edit user
       const requestParams: EditUserInterface = request.body;

       const { error } = patchUserSchema.validate(requestParams);
       if( error ) return response.status(400).json(toObj(response,{Error: error.message}));

       //get and validate user_id given in path
       const user_to_patch = request.params.user_id;
       if(user_to_patch != userPayload.user_id) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

       //Get user from database
       let user: (UserModel | null) = await UserModel.findByPk(user_to_patch);
       if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));

       let countChanges: number = 0;

       if(requestParams.birthday == null) {
           user.birthday = null;
       }

       //change data
       if(user.birthday != requestParams.birthday && requestParams.birthday != undefined){
           user.birthday = requestParams.birthday;
           countChanges++;
       }

       if(user.name != requestParams.name && requestParams.name){
           user.name = requestParams.name;
           countChanges++;
       }

       //save user
       user.save()
           .then(() => {
               return response.status(200).json(toObj(response,{Info: "User succesfully updated",Changes: countChanges}));
           })
           .catch((err: Error) => {
               console.log(err);
               return response.status(500).json(toObj(response));
           });
    }

    //DELETE User (JWT, Sysadmin)
    public static async deleteUserByAdmin(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing jwtpayload");
            return response.status(500).json(toObj(response));
        }

        const user_to_delete = request.params.user_id;

        try {
            const user: UserModel | null = await UserModel.findByPk(user_to_delete);
            if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));

            await user.destroy();

            return response.status(200).json(toObj(response));

        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }
    }

    //Account Deletion
    public static async requestAccountDeletion(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
        console.error("Controller Error: Missing userPayload");
        return response.status(500).json(toObj(response));
        }

        //get and validate user_id given in path
        if(request.params.user_id != userPayload.user_id)
        return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        try {

        const user: (UserModel | null) = await UserModel.findOne({ where: {user_id: userPayload.user_id} });
        if(!user) return response.status(404).json(toObj(response,{Error: customError.userNotFound}));

        let payload: JWTAccountDeletionInterface = {user_id: userPayload.user_id};

        const token = jwt.sign(payload,<jwt.Secret>(process.env.JWT_DELETE_ACCOUNT_SECRET), {
            expiresIn: String(process.env.JWT_DELETE_ACCOUNT_EXPIRES_IN)
        });

        //send email with token
        const mailError = await MailController.sendDeleteAccountMail(user, token);

        if(mailError) {
            console.error(mailError);
            return response.status(500).json(toObj(response));
        }

        console.info("User " + user.name + " has sent a account deletion email to " + user.email);
        return response.status(200).json(toObj(response));

        } catch ( error ) {
        console.error(error);
        return response.status(500).json(toObj(response));
        }
    }
    public static async accountDeletion(request: Request, response: Response) {
        const requestParams: AccountDeletionInterface = request.body;

        const { error } = accountDeletionSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));

        //Try to validate the key
        try {

        //verify
        const verifiedPayload: JWTAccountDeletionInterface = <JWTAccountDeletionInterface>jwt.verify(requestParams.deletion_key, <jwt.Secret>(process.env.JWT_DELETE_ACCOUNT_SECRET));

        //validate user information
        const user: (UserModel | null) = await UserModel.findOne({where: {user_id: verifiedPayload.user_id}});
        if(!user) {
            console.info("User (" + verifiedPayload.user_id + ") which is specified in account deletion payload does not exist")
            return response.status(400).json(toObj(response,{Error: customError.invalidToken})); //user not found
        }

        //check if iat and exp is specified in token
        const jwt_iat = verifiedPayload.iat;
        const jwt_exp = verifiedPayload.exp;

        if(!jwt_iat || !jwt_exp) {
            console.info("User " + user.name + "(" + user.user_id + ") could not be deleted because parameter iat or exp is missing in payload")
            return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
        }

        const validPass = user.checkIfUnencryptedPasswordIsValid(requestParams.password);
        if(!validPass) return response.status(401).json(toObj(response, {Error: customError.authenticationFailed}));

        user.destroy()
        .then(() => {
            console.info("User " + user.name + " has been deleted successfully");
            return response.status(200).json(toObj(response));
        })
        .catch((err: Error) => {
            console.error(err);
            return response.status(500).json(toObj(response));
        });

        } catch ( error ) {

            if(error instanceof jwt.TokenExpiredError) {
                return response.status(400).json(toObj(response,{Error: customError.expiredToken}))
            }

            console.warn("Unknown error when verifying a jwt deletion payload!")
            console.error(error)
            return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
        }
    }

    //GET all calendars which have the user as member (JWT)
    public static async getAssociatedCalendars(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing jwtpayload");
            return response.status(500).json(toObj(response));
        }

        //get and validate user_id given in path
        const requested_user_id = request.params.user_id
        if(requested_user_id != userPayload.user_id) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        try {
            const calendars: Array<CalendarUserLinkModel> | null = await CalendarUserLinkModel.findAll({
                where: {
                    user_id: requested_user_id
                },
                include: [{
                    model: CalendarModel,
                    as: 'calendarObject',
                    attributes: ['calendar_id', 'calendar_name', 'can_join', 'raw_color_legend', 'creation_date']
                }]
            });

            if(!calendars) return response.status(404).json(toObj(response, {Error: customError.calendarNotFound}));

            let responseList = new Array<AssociatedCalendarInterface>();
            let failed = false;

            for ( const listObject of calendars ) {

                let newAssociatedUser: AssociatedCalendarInterface = {
                    calendarObject: listObject.calendarObject,
                    is_owner: listObject.is_owner,
                    can_create_events: listObject.can_create_events,
                    can_edit_events: listObject.can_edit_events,
                    color: listObject.color,
                    icon: listObject.icon
                };

                responseList.push(newAssociatedUser);
            }

            if(failed) return response.status(500).json(toObj(response));

            return response.status(200).json(toObj(response,{associated_calendars: responseList}))
        } catch ( error ) {
            console.error(error);
            return response.status(500).json(toObj(response))
        }
    }

    //POST Change Profile Picture (JWT)
    public static async changeProfilePicture(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get and validate user_id given in path
        const user_to_patch = request.params.user_id;
        if(user_to_patch != userPayload.user_id) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        //find user in database
        let user: UserModel | null;

        try {
            user = await UserModel.findByPk(user_to_patch);
            if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));
        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }

        const profilePictureUpload = multer({
            storage: multer.diskStorage({
                filename: (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
                    callback(null, user_to_patch + path.extname(file.originalname));
                },
                destination: 'static/images/profile_pictures/'
            }),
            limits: { fileSize: 1000000 * 5}, //5MB
            fileFilter: async (request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
                console.log(request)

                if (file.mimetype != "image/jpeg") {
                    return callback(new Error("Only .jpeg images are allowed!"));
                }

                callback(null, true);
            }
        }).single("avatar")

        //Upload the picture to destination
        profilePictureUpload(request, response,function (error: any) {
            if(user && request.file) {
                console.log("User " + user.name + "(" + user_to_patch + ") changes Avatar. Size: " + Number(request.file.size / 1000000).toFixed(2) + "MB")
            }

            if( error instanceof MulterError ) {
                console.error(error);
                return response.status(413).json(toObj(response, {Error: customError.payloadTooLarge}));
            } else if( error instanceof  Error) {
                console.error(error);
                return response.status(500).json(toObj(response));
            }

            response.status(200).json(toObj(response,{Info: "Profile Picture successfully updated"}));
        });
    }

    //GET Profile Picture
    public static async getProfilePicture(request: Request, response: Response) {
        //get user_id given in path
        const user_id = request.params.user_id;

        //find user in database
        try {
            const user: UserModel | null = await UserModel.findByPk(user_id);
            if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));
        } catch ( error ) {
            console.log(error);
            return response.status(500).json(toObj(response));
        }

        //set Paths
        const picturePath: string = path.join(process.cwd(), "static", "images", "profile_pictures", user_id + ".png");
        const defaultPath: string = path.join(process.cwd(), "static", "images", "default-profile.png");

        //check on paths available and return profile image
        try {
            if (filesystem.existsSync(picturePath)) {
                response.status(200).sendFile(picturePath);
            } else if (filesystem.existsSync(defaultPath)) {
                response.status(200).sendFile(defaultPath);
            } else {
                console.error("Error: No default profile_picture was found in '" + defaultPath + "'!");
                response.status(500).json(toObj(response));
            }

        } catch( error ) {
            console.error(error)
            response.status(500).json(toObj(response));
        }
    }

    public static async generateUserInformationEmail(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get and validate user_id given in path
        if(request.params.user_id != userPayload.user_id)
            return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        const userID: string = userPayload.user_id;

        let informationString: string = "";

        try{
            //########## get user data ##########
            let response_user_attr: Array<string> = ['user_id','name','email','birthday','registered_at', 'active'];

            const user: (UserModel | null) = await UserModel.findOne({attributes: response_user_attr, where: {user_id: userID}, include: [{model: UserRoleModel, as: 'roleObject', attributes: ['full_name','description']}]});
            if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));

            informationString += "#### Nutzerinformationen ####\n\n";
            informationString += "ID             : " + user.user_id   + "\n";
            informationString += "Nutzername     : " + user.name                 + "\n";
            informationString += "Email          : " + user.email                + "\n";
            informationString += "Geburtstag     : " + user.birthday?.toString() + "\n";
            informationString += "Registriert am : " + user.registered_at.toString() + "\n";
            informationString += "Nutzer gebannt : " + (!user.active).toString()    + "\n";
            informationString += "Status         : " + user.roleObject.full_name + "\n";

            //########## get calendar data ##########
            informationString += "\n#### Mitglied in Kalender ####\n";

            const calendars: Array<CalendarUserLinkModel> = await CalendarUserLinkModel.findAll({
                where: {
                    user_id: userID
                },
                include: [{
                    model: CalendarModel,
                    as: 'calendarObject',
                    attributes: ['calendar_id', 'calendar_name', 'creation_date']
                }]
            });

            for ( const listObject of calendars ) {

                informationString += "\n- " + listObject.calendarObject.calendar_id + "\n";
                informationString += "  Name                  : " + listObject.calendarObject.calendar_name + "\n";
                informationString += "  Ist Administrator     : " + listObject.is_owner.toString() + "\n";
                informationString += "  Kann Events erstellen : " + listObject.can_create_events.toString() + "\n";
                informationString += "  Kann Events bearbeiten: " + listObject.can_edit_events.toString() + "\n";
                informationString += "  Farbe                 : " + listObject.color.toString() + "\n";
                informationString += "  Symbol                : " + listObject.icon.toString() + "\n";
                informationString += "  Erstellt am           : " + listObject.calendarObject.creation_date.toString() + "\n";
            }

            //########## get event data ##########
            informationString += "\n#### Erstellte Events ####\n";

            const response_event_attr = ['associated_calendar', 'event_id', 'title', 'description', "begin_date", 'end_date', 'creation_date', 'color', 'created_by_user', 'daylong', 'pinned_note'];

            const events: (Array<EventModel> | null) = await EventModel.findAll({
                attributes: response_event_attr,
                where: {
                    created_by_user: userID
                },
            });

            for ( const listObject of events ) {

                informationString += "\n- " + listObject.event_id.toString() + "\n";
                informationString += "  Kalender    : " + listObject.associated_calendar + "\n";
                informationString += "  Title       : " + listObject.title + "\n";
                informationString += "  Beschreibung: " + listObject.description + "\n";
                informationString += "  Start       : " + listObject.begin_date.toString() + "\n";
                informationString += "  Ende        : " + listObject.end_date.toString() + "\n";
                informationString += "  Farbe       : " + listObject.color.toString() + "\n";
                informationString += "  Ganztägig   : " + listObject.daylong.toString() + "\n";
                informationString += "  Erstellt am : " + listObject.creation_date.toString() + "\n";
            }

            //########## get notes data ##########
            informationString += "\n#### Erstellte Notizen ####\n";

            const response_note_attr = ['note_id', 'title', 'content', "color", 'pinned', 'associated_calendar', 'owner_id', 'creation_date', 'modification_date'];

            const notes: (Array<NoteModel> | null) = await NoteModel.findAll({
                attributes: response_note_attr,
                where: {
                    owner_id: userID
                }
            });

            for ( const listObject of notes ) {

                informationString += "\n- " + listObject.note_id.toString() + "\n";
                informationString += "  Titel       : " + listObject.title + "\n";
                informationString += "  Inhalt      : " + listObject.content + "\n";
                informationString += "  Farbe       : " + listObject.color.toString() + "\n";
                informationString += "  Angepinnt   : " + listObject.pinned.toString() + "\n";
                informationString += "  Kalender    : " + listObject.associated_calendar.toString() + "\n";
                informationString += "  Erstellt am : " + listObject.creation_date.toString() + "\n";
                informationString += "  Geändert am : " + listObject.modification_date.toString() + "\n";

            }

            //send email with token
            const mailError = await MailController.sendUserInformationMail(user, informationString);

            if(mailError) {
                console.error(mailError);
                return response.status(500).json(toObj(response));
            }

            console.info("User " + user.name + " has sent a profil information email to " + user.email);
            return response.status(200).json(toObj(response));

        } catch (error) {
            console.error(error);
            return response.status(500).json(toObj(response));
        }
    }
}

export default UserController;
