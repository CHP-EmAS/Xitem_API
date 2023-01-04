import { Request, Response, NextFunction } from "express";
import toObj from "../config/responseStandart"

class ErrorHandler {
    public static async checkPreError(request: Request, response: Response, next: NextFunction, error?: Error) {
        if (error instanceof SyntaxError) {
            console.error(error);
            response.status(400).json(toObj(response,{Error: error.message}));
        } else if (error){
            console.error(error);
            response.status(500).json(toObj(response));
        } else {
            next();
        }
    }
}

export default ErrorHandler;