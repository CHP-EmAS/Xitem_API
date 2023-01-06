import { Request, Response, NextFunction } from "express";

import toObj from "../config/responseStandart"

class CorsHandler {
    public static async cors(request: Request, response: Response, next: NextFunction) {
      //set headers
      response.header("Access-Control-Allow-Origin","*");
      response.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, auth-token, refresh-token, security-token"
      );
      response.header(
        "Access-Control-Expose-Headers",
        "auth-token, refresh-token. security-token",
      );
      
      //set OPTIONS headers
      if(request.method === "OPTIONS") {
        response.header("Access-Control-Allow-Methods","GET, PUT, POST, PATCH, DELETE");
        return response.status(200).json(toObj(response));
      }

      next();
    }
}

export default CorsHandler;