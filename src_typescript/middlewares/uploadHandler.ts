import multer, {MulterError} from "multer";
import {NextFunction, Request, Response} from "express";
import path from "path";
import toObj from "../config/responseStandart";
import * as customError from "../config/errorCodes";
import {LocalPayloadInterface} from "../validation/interfaces";

class UploadHandler {
    public static async checkProfilePictureUploadPermissions(request: Request, response: Response, next: NextFunction) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        //get and validate user_id given in path
        const user_to_patch = request.params.user_id;
        if(user_to_patch != userPayload.user_id) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        next();
    }

    public static readonly profilePictureUploadMiddleware = multer({
        storage: multer.diskStorage({
            filename: this.profilePictureFileNameBuilder,
            destination: '/tmp/upload'
        }),
        limits: { fileSize: 1000000 * 5}, //5MB
        fileFilter: this.profilePictureFileFilter
    }).single("avatar")

    private static profilePictureFileNameBuilder(request: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void): void {
        const user_to_patch: string = request.params.user_id;

        if(!user_to_patch) {
            callback(new Error("Profile Picture upload error: No user_id found in request path parameters"), "")
            return;
        }

        callback(null, user_to_patch + path.extname(file.originalname));
    }

    private static profilePictureFileFilter(request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void {
        const extension: string = path.extname(file.originalname);

        if (!(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif")) {
            return callback(new MulterError("LIMIT_UNEXPECTED_FILE"));
        }

        callback(null, true);
    }
}

export default UploadHandler
