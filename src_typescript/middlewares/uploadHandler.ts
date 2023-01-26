import multer, {MulterError} from "multer";
import {NextFunction, Request, Response} from "express";
import path from "path";
import toObj from "../config/responseStandart";
import * as customError from "../config/errorCodes";
import {LocalPayloadInterface} from "../validation/interfaces";
import crypto from "crypto";

class UploadHandler {
    public static readonly profilePictureUploadMiddleware = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 1000000 * 3}, //5MB
        fileFilter: this.profilePictureFileFilter
    }).single("avatar")

    static getFileType(fileBuffer: Buffer): FileType {
        const magicNumber: string = fileBuffer.toString("hex",0,8).toUpperCase()

        if(magicNumber == "89504E470D0A1A0A") {
            return FileType.PNG
        }

        if(magicNumber.slice(0, 6) == "FFD8FF") {
            return FileType.JPG
        }

        if(magicNumber.slice(0, 8) == "47494638") {
            return FileType.GIF
        }

        return FileType.INVALID
    }

    static hashFile(fileBuffer: Buffer): string {
        const hashSum = crypto.createHash('SHA256')
        hashSum.update(fileBuffer)

        return hashSum.digest('hex')
    }

    private static profilePictureFileNameBuilder(request: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void): void {
        const user_to_patch: string = request.params.user_id;

        if(!user_to_patch) {
            callback(new Error("Profile Picture upload error: No user_id found in request path parameters"), "")
            return;
        }

        callback(null, user_to_patch);
    }

    private static profilePictureFileFilter(request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void {
        const extension: string = path.extname(file.originalname);

        if (!(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif")) {
            return callback(new MulterError("LIMIT_UNEXPECTED_FILE"));
        }

        callback(null, true);
    }
}

export const enum FileType {
    PNG = "png",
    JPG = "jpg",
    GIF = "gif",
    INVALID = "invalid",
}

export default UploadHandler
