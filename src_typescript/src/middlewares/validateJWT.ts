import {NextFunction, Request, Response} from "express";
import jwt, {TokenExpiredError} from "jsonwebtoken";

import * as customError from "../config/errorCodes"
import toObj from "../config/responseStandart"

import {JWTPayloadInterface, LocalPayloadInterface} from "../validation/interfaces";
import {UserModel} from "../models/User";
import {UserRoleModel} from "../models/UserRole";

export const enum TokenType {
  Authentication = "auth",
  Refresh = "refresh",
  Security = "secure",
}

export const authProtected = async (request: Request, response: Response, next: NextFunction) => {
  //Get the jwt token from headers
  const token: string = <string>request.headers["auth-token"];

  if(!token) return response.status(401).json(toObj(response,{Error: customError.tokenRequired}));

  //Try to validate the token
  const localPayload: (LocalPayloadInterface | Error) = await validateToken(token, TokenType.Authentication);

  if(localPayload instanceof Error) {

    //auth token could not be verified
    return response.status(401).json(toObj(response,{Error: localPayload.message}));

  } else {

    //store jwt informations in locals
    response.locals.userPayload = localPayload;

    //rufe nächste 
    next();
  }
};

export const highSecurity = async (request: Request, response: Response, next: NextFunction) => {
  const userPayload: LocalPayloadInterface = response.locals.userPayload;

  if(!userPayload) {
      console.error("Error: Missing userPayload in high security route, do 'checkJWT' before high security route!");
      return response.status(500).json(toObj(response));
  }

  //Get the auth token from headers
  const securityToken: string = <string>request.headers["security-token"];

  if(!securityToken) {
      console.error("Missing security-token header! security-token header not provided on high security route.")
      return response.status(401).json(toObj(response,{Error: customError.tokenRequired}));
  }

  //Try to validate the token
  const securityPayload: (LocalPayloadInterface | Error) = await validateToken(securityToken, TokenType.Security);

  if(securityPayload instanceof Error) {
    return response.status(401).json(toObj(response,{Error: securityPayload.message}));
  } else {

    if(securityPayload.user_id != userPayload.user_id) {
      return response.status(401).json(toObj(response,{Error: customError.invalidToken}));
    }

  }

  console.log("User " + userPayload.name + "(" + userPayload.user_id + ") enters high security Route!")

  next();
};

export const validateToken = async (token: string, tokenType: TokenType) : Promise<LocalPayloadInterface | Error> => {
  try {

    //verify
    let verifiedPayload: JWTPayloadInterface;

    switch(tokenType) {
      case TokenType.Authentication:
        verifiedPayload = <JWTPayloadInterface>jwt.verify(token, <jwt.Secret>(process.env.JWT_AUTH_TOKEN_SECRET));
        break;
      case TokenType.Refresh:
        verifiedPayload = <JWTPayloadInterface>jwt.verify(token, <jwt.Secret>(process.env.JWT_REFRESH_TOKEN_SECRET));
        break;
      case TokenType.Security:
        verifiedPayload = <JWTPayloadInterface>jwt.verify(token, <jwt.Secret>(process.env.JWT_SECURITY_TOKEN_SECRET));
        break;
    }

    //validate user information
    const user: (UserModel | null) = await UserModel.findOne({where: {user_id: verifiedPayload.user_id}, include: [{model: UserRoleModel, as: 'roleObject'}]});
    if(!user) {
      console.error("User " + "(" + verifiedPayload.user_id + ") which is specified in payload does not exist")
      return new Error(customError.invalidToken); //user not found
    } 

    if(!user.active) {
      console.error("User " + user.name + "(" + user.user_id + ") could not be verified because this user is banned")
      return new Error(customError.bannedUser); //user not activ
    }

    //check if password has change after token was created
    const jwt_iat = verifiedPayload.iat;

    if(!jwt_iat) {
      console.error("User " + user.name + "(" + user.user_id + ") could not be verified because parameter iat is missing in payload")
      return new Error(customError.invalidToken);
    } 

    if((jwt_iat*1000) < user.password_changed_at.valueOf()) {
      console.error("User " + user.name + "(" + user.user_id + ") could not be verified because password has changed after the payload was created")
      return new Error(customError.passwordChanged);
    } 
    
    //store jwt in locals
    return {user_id: verifiedPayload.user_id, name: user.name, role: user.roleObject};

  } catch ( error: unknown ) {

    if(error instanceof TokenExpiredError) {
      return new Error(customError.expiredToken);
    }

    console.error("Unknown error when verifying a jwt payload!")
    console.error(error)
    return new Error(customError.invalidToken);
  }

}