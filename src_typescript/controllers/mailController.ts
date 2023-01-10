import * as nodemailer from 'nodemailer';

import path from 'path';
import fs from 'fs';

import { UserModel } from "../models/User"
import Mail from 'nodemailer/lib/mailer';

import { JWTEmailVerificationInterface } from "../validation/interfaces"

class MailController {

    private static transport: Mail;
    
    private static welcome_template: string;
    private static password_recovery_template: string;
    private static user_information_template: string;
    private static delete_account_request_template: string;


    public static init(): void {

        MailController.transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            auth: {
               user: process.env.MAIL_USER,
               pass: process.env.MAIL_PASSWORD
            },
        });
        
        MailController.transport.verify(function(error) {
            if(error) {
                console.error("Failed to initialize NodeMailer! >> HOST: " + process.env.MAIL_HOST + ":" + process.env.MAIL_PORT + ", USER: " + process.env.MAIL_USER)
                console.error(error)
            } else {
                console.info("NodeMailer connected to " + process.env.MAIL_HOST + ":" + process.env.MAIL_PORT + " with user <" + process.env.MAIL_USER + ">")
            }
        });

        MailController.welcome_template                 = fs.readFileSync(path.join(process.cwd(), "static", "email_template", "welcome.html"), "utf8")
        MailController.password_recovery_template       = fs.readFileSync(path.join(process.cwd(), "static", "email_template", "password_recovery.html"), "utf8")
        MailController.user_information_template        = fs.readFileSync(path.join(process.cwd(), "static", "email_template", "user_informations.html"), "utf8")
        MailController.delete_account_request_template  = fs.readFileSync(path.join(process.cwd(), "static", "email_template", "delete_account_request.html"), "utf8")

        MailController.welcome_template                 = MailController.welcome_template.split("{{app_name}}").join(String(process.env.APP_NAME))
        MailController.password_recovery_template       = MailController.password_recovery_template.split("{{app_name}}").join(String(process.env.APP_NAME))
        MailController.user_information_template        = MailController.user_information_template.split("{{app_name}}").join(String(process.env.APP_NAME))
        MailController.delete_account_request_template  = MailController.delete_account_request_template.split("{{app_name}}").join(String(process.env.APP_NAME))

    }

    public static async sendVerificationMail(payload: JWTEmailVerificationInterface, verify_key: string): Promise<( Error | null )> {

        let emailContent: string = MailController.welcome_template.replace("{{nickname}}", payload.name);
        emailContent = emailContent.replace("{{verify_key}}", verify_key)
        emailContent = emailContent.replace("{{email}}", payload.email)

        const message = {
            from: process.env.APP_NAME + " <" + process.env.MAIL_USER + ">",
            to: payload.email,
            subject: "Wilkommen bei " + process.env.APP_NAME + "!",
            html: emailContent
        };
        
        MailController.transport.sendMail(message, function(error: (Error|null)) {
            if (error) {
              return error
            }
        });
        
        return null
    }

    public static async sendPasswordRecoveryMail(user: UserModel, recovery_key: string): Promise<( Error | null )> {

        let emailContent: string = MailController.password_recovery_template.replace("{{nickname}}", user.name);
        emailContent = emailContent.replace("{{recovery_key}}", recovery_key)
        emailContent = emailContent.replace("{{email}}", user.email)

        const message = {
            from: process.env.APP_NAME + " <" + process.env.MAIL_USER + ">",
            to: user.email,
            subject: process.env.APP_NAME + " Passwort Wiederherstellung",
            html: emailContent
        };
        
        MailController.transport.sendMail(message, function(error: (Error|null)) {
            if (error) {
              return error
            }
        });
        
        return null
    }

    public static async sendUserInformationMail(user: UserModel, dataInformation: string): Promise<( Error | null )> {

        const emailContent: string = MailController.user_information_template.replace("{{nickname}}", user.name);

        const picturePath: string = path.join(process.cwd(), "static", "images", "profile_pictures", user.user_id + ".png");
        
        let attachments;

        //check on paths available and return profile image
        try {
            if (fs.existsSync(picturePath)) {
                attachments = [
                    {
                        filename: user.name + '.txt',
                        content: dataInformation
                    },
                    {
                        filename: user.name + '.png',
                        path: picturePath
                    }
                ];
            } else {
                attachments = [
                    {
                        filename: user.name + '.txt',
                        content: dataInformation
                    }
                ];
            }

        } catch( error: unknown ) {
            if(error instanceof Error) {
                return error;
            }

            return Error("Unknown Error");
        }

        const message = {
            from: process.env.APP_NAME + " <" + process.env.MAIL_USER + ">",
            to: user.email,
            subject: process.env.APP_NAME + " Profil Informationen",
            html: emailContent,
            attachments: attachments,
        };
        
        MailController.transport.sendMail(message, function(error: (Error|null)) {
            return error
        });

        return null
    }

    public static async sendDeleteAccountMail(user: UserModel, delete_key: string): Promise<( Error | null )> {

        let emailContent: string = MailController.delete_account_request_template.replace("{{nickname}}", user.name);
        emailContent = emailContent.replace("{{delete_key}}", delete_key)
        emailContent = emailContent.replace("{{email}}", user.email)

        const message = {
            from: process.env.APP_NAME + " <" + process.env.MAIL_USER + ">",
            to: user.email,
            subject: process.env.APP_NAME + " Konto löschen",
            html: emailContent
        };
        
        MailController.transport.sendMail(message, function(error: (Error|null)) {
            if (error) {
              return error
            }
        });
        
        return null
    }
}

export default MailController;