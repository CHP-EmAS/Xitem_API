import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import uuid from "uuid";

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes" 

import MailController from "./mailController"

import { LoginInterface, RegistrationInterface, JWTPayloadInterface, LocalPayloadInterface, ChangePasswordInterface, JWTEmailVerificationInterface, JWTPasswordRecoveryInterface, ValidationEmailInterface, ResetPasswordInterface} from "../validation/interfaces"
import { loginUserSchema, registerUserSchema, changePasswordSchema, resetPasswordSchema, validateEmailSchema } from "../validation/authValidationSchemas";
import { isValidEmailAddress } from "../validation/standartSchemas";
import { validateToken, TokenType } from "../middlewares/validateJWT";

import { UserModel } from "../models/User";
import { Roles } from "../middlewares/checkRole";

class AuthController {

  //standard login/register/change password
  public static async login(request: Request, response: Response) {

    const requestParams: LoginInterface = request.body;
    
    const { error } = loginUserSchema.validate(requestParams)
    if( error ) return response.status(400).json(toObj(response,{Error: error.message}));
    
    requestParams.email = requestParams.email.toLowerCase();

    const user: (UserModel | null) = await UserModel.findOne({ where: {email: requestParams.email} });
    if(!user) return response.status(401).json(toObj(response, {Error: customError.authenticationFailed}));
    
    if(!user.active) return response.status(403).json(toObj(response, {Error: customError.bannedUser}));

    const validPass = user.checkIfUnencryptedPasswordIsValid(requestParams.password);
    if(!validPass) return response.status(401).json(toObj(response, {Error: customError.authenticationFailed}));
    
    let payload: JWTPayloadInterface = {user_id: user.user_id};

    const auth_token = jwt.sign(payload,<jwt.Secret>(process.env.JWT_AUTH_TOKEN_SECRET), {
      expiresIn: String(process.env.JWT_AUTH_EXPIRES_IN)
    });

    const refresh_token = jwt.sign(payload,<jwt.Secret>(process.env.JWT_REFRESH_TOKEN_SECRET), {
      expiresIn: String(process.env.JWT_REFRESH_EXPIRES_IN)
    });

    response.header({'auth-token':auth_token, 'refresh-token':refresh_token}).status(200).json(toObj(response,{user_id: user.user_id}));

    console.info("User " + user.name + "(" + user.user_id + ") has logged in")
  }
  public static async changePassword(request: Request, response: Response) {
    //get and validate JWT Payload
    const userPayload: LocalPayloadInterface = response.locals.userPayload;

    if(!userPayload) {
        console.error("Controller Error: Missing jwtpayload");
        return response.status(500).json(toObj(response));
    }

    const requestParams: ChangePasswordInterface = request.body;

    const { error } = changePasswordSchema.validate(requestParams);
    if(error) return response.status(400).json(toObj(response,{Error: error.message}));

    let user: UserModel | null;

    try {
      user = await UserModel.findByPk(userPayload.user_id);
      if(!user) return response.status(404).json(toObj(response, {Error: customError.userNotFound}));
    } catch ( error ) {
      console.log(error);
      return response.status(500).json(toObj(response));
    }

    if (!user.checkIfUnencryptedPasswordIsValid(requestParams.old_password)) {
      return response.status(401).json(toObj(response, {Error: customError.wrongPassword}));
    }

    user.hashPassword(requestParams.new_password);
    user.password_changed_at = new Date(Date.now())

    user.save()
      .then(() => {
        return response.status(200).json(toObj(response,{Info: "Password changed"}));
      })
      .catch((err: Error) => {
        console.log(err); 
        return response.status(500).json(toObj(response));
      });
  }

  //Email verification
  public static async generateVerificationEmail(request: Request, response: Response) {
    
    const requestParams: RegistrationInterface = request.body;

    const { error } = registerUserSchema.validate(requestParams);
    if(error) return response.status(400).json(toObj(response,{Error: error.message}));

    requestParams.email = requestParams.email.toLowerCase();

    try {
      const existingUser: (UserModel | null) = await UserModel.findOne({ where: {email: requestParams.email} });
      if(existingUser) return response.status(400).json(toObj(response,{Error: customError.emailExistsError}));

      let payload: JWTEmailVerificationInterface = {email: requestParams.email, name: requestParams.name, birthday: requestParams.birthday};

      const token = jwt.sign(payload,<jwt.Secret>(process.env.JWT_EMAIL_SECRET), {
        expiresIn: String(process.env.JWT_EMAIL_EXPIRES_IN)
      });

      //send email with token
      const mailError = await MailController.sendVerificationMail(payload,token);

      if(mailError) {
        console.error(mailError);
        return response.status(500).json(toObj(response));
      }

      console.info("User " + requestParams.name + " has sent a verification email to " + requestParams.email);
      return response.status(200).json(toObj(response));

    } catch ( error ) {
      console.error(error);
      return response.status(500).json(toObj(response));
    }
  }
  public static async verifyEmail(request: Request, response: Response) {
    //get verify key given in path
    const requestParams: ValidationEmailInterface = request.body;

    const { error } = validateEmailSchema.validate(requestParams);
    if(error) return response.status(400).json(toObj(response,{Error: error.message}));

    //Try to validate the key
    try {

      //verify
      const verifiedPayload: JWTEmailVerificationInterface = <JWTEmailVerificationInterface>jwt.verify(requestParams.validation_key, <jwt.Secret>(process.env.JWT_EMAIL_SECRET));

      //check if iat and exp is specified in token
      const jwt_iat = verifiedPayload.iat;
      const jwt_exp = verifiedPayload.exp;

      if(!jwt_iat || !jwt_exp) {
        console.info("Email of User " + verifiedPayload.name + "(" + verifiedPayload.email + ") could not be verified because parameter iat or exp is missing in payload")
        return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
      } 

      const existingUser: (UserModel | null) = await UserModel.findOne({ where: {email: verifiedPayload.email} });
      if(existingUser) return response.status(400).json(toObj(response,{Error: customError.emailExistsError}));
      
      let user = new UserModel({email: verifiedPayload.email, name: verifiedPayload.name});

      user.hashPassword(requestParams.password);
      user.password_changed_at = new Date(Date.now())

      user.user_id = uuid.v4();
      user.active = true;
      user.role = Roles.Verified;

      if(verifiedPayload.birthday) {
        user.birthday = verifiedPayload.birthday;
      }
    
      user.save()
        .then((newUser: UserModel) => {
          console.info("New user " + user.name + "(" + user.user_id + ") has successfully registered")
          return response.status(201).json(toObj(response,{ user_id: newUser.user_id }));
        })
        .catch((err: Error) => {
          console.error(err); 
          return response.status(500).json(toObj(response))
        });

    } catch ( error: unknown ) {

      if(error instanceof jwt.TokenExpiredError) {
          return response.status(400).json(toObj(response,{Error: customError.expiredToken}))
      }

      console.warn("Unknown error when verifying a jwt email payload!")
      console.error(error)

      return response.status(400).json(toObj(response,{Error: customError.invalidToken}))
    }
  }

  //Password reset
  public static async generatePasswordRecoveryKey(request: Request, response: Response) {

    //get verify key given in path
    const path_email = request.params.email;

    const { error } = isValidEmailAddress.validate({email: path_email});
    if(error) return response.status(400).json(toObj(response,{Error: customError.invalidEmail}));

    try {
      const user: ( UserModel | null ) = await UserModel.findOne({ where: {email: path_email} });
      
      if(user) {
        let payload: JWTPasswordRecoveryInterface = {user_id: user.user_id};

        const token = jwt.sign(payload,<jwt.Secret>(process.env.JWT_RECOVERY_SECRET), {
          expiresIn: String(process.env.JWT_RECOVERY_EXPIRES_IN)
        });

        //send email with token
        const mailError = await MailController.sendPasswordRecoveryMail(user,token);

        if(mailError) {
          console.error(mailError);
          return response.status(500).json(toObj(response));
        }

        console.info("Account " + user.name + "(" + user.user_id + ") has requested a password recovery email to " + user.email);
      } else {
        console.info("Cannot send a password recovery email to " + path_email + "! User not found.");
      }

      return response.status(200).json(toObj(response));
    } catch ( error ) {
      console.error(error);
      return response.status(500).json(toObj(response));
    }      
  }
  public static async resetPassword(request: Request, response: Response) {
  
    const requestParams: ResetPasswordInterface = request.body;

    const { error } = resetPasswordSchema.validate(requestParams);
    if(error) return response.status(400).json(toObj(response,{Error: error.message}));

    //Try to validate the key
    try {

      //verify
      const verifiedPayload: JWTPasswordRecoveryInterface = <JWTPasswordRecoveryInterface>jwt.verify(requestParams.recovery_key, <jwt.Secret>(process.env.JWT_RECOVERY_SECRET));

      //validate user information
      const user: (UserModel | null) = await UserModel.findOne({where: {user_id: verifiedPayload.user_id}});
      if(!user) {
        console.info("User (" + verifiedPayload.user_id + ") which is specified in password recovery payload does not exist")
        return response.status(400).json(toObj(response,{Error: customError.invalidToken})); //user not found
      } 

      //check if iat and exp is specified in token
      const jwt_iat = verifiedPayload.iat;
      const jwt_exp = verifiedPayload.exp;

      if(!jwt_iat || !jwt_exp) {
        console.info("Password of User " + user.name + "(" + user.user_id + ") could not be reset because parameter iat or exp is missing in payload")
        return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
      } 

      //check if user is activ
      if(!user.active) {
        console.info("Password of User " + user.name + "(" + user.user_id + ") could not be reset because this user is banned")
        return response.status(400).json(toObj(response,{Error: customError.bannedUser})); //user not activ
      }

      if((jwt_iat*1000) < user.password_changed_at.valueOf()) {
        console.info("Password of User " + user.name + "(" + user.user_id + ") could not be reset because password has changed after the payload was created")
        return response.status(400).json(toObj(response,{Error: customError.passwordChanged}));
      } 
      
      user.hashPassword(requestParams.new_password);
      user.password_changed_at = new Date(Date.now())

      user.save()
      .then(() => {
        console.info("Password of User " + user.name + " has been reset successfully");
        return response.status(200).json(toObj(response));
      })
      .catch((err: Error) => {
        console.error(err); 
        return response.status(500).json(toObj(response));
      });

    } catch ( error: unknown ) {

      if(error instanceof jwt.TokenExpiredError) {
        return response.status(400).json(toObj(response,{Error: customError.expiredToken}));
      }

      console.warn("Unknown error when verifying a jwt recovery payload!")
      console.error(error)

      return response.status(400).json(toObj(response,{Error: customError.invalidToken}));
    }
  }

  //Token
  public static async refreshAuthenticationToken(request: Request, response: Response) {
    //Get the jwt tokens from headers
    const auth_token: string = <string>request.headers["auth-token"];
    const refresh_token: string = <string>request.headers["refresh-token"];

    if(!auth_token) return response.status(401).json(toObj(response,{Error: customError.tokenRequired}));
    if(!refresh_token) return response.status(401).json(toObj(response,{Error: customError.tokenRequired}));

    //Try to validate the token
    const auth_localPayload: (LocalPayloadInterface | Error) = await validateToken(auth_token, TokenType.Authentication);
    const refresh_localPayload: (LocalPayloadInterface | Error) = await validateToken(refresh_token, TokenType.Refresh);

    if(refresh_localPayload instanceof Error) {
      return response.status(401).json(toObj(response,{Error: refresh_localPayload.message}));
    }

    if(auth_localPayload instanceof Error) {

      if(auth_localPayload.message == customError.expiredToken) {
        let unverifiedAuthPayload: JWTPayloadInterface = <JWTPayloadInterface>jwt.decode(auth_token);

        if(unverifiedAuthPayload.user_id == refresh_localPayload.user_id) {
          
          let new_payload: JWTPayloadInterface = {user_id: refresh_localPayload.user_id};

          const new_auth_token = jwt.sign(new_payload,<jwt.Secret>(process.env.JWT_AUTH_TOKEN_SECRET), {
            expiresIn: String(process.env.JWT_AUTH_EXPIRES_IN)
          });
          
          console.info("User " + refresh_localPayload.name + " (" + refresh_localPayload.user_id + ") has renewed his auth-token!");
          return response.header('auth-token',new_auth_token).status(200).json(toObj(response));
        }
      }

    } else {
      return response.status(400).json(toObj(response,{Error: customError.tokenStillValid}));
    }

    return response.status(401).json(toObj(response,{Error: customError.invalidToken}));
  }
  public static async getSecurityToken(request: Request, response: Response) {
    //Get the jwt tokens from headers
    const auth_token: string = <string>request.headers["auth-token"];
    const refresh_token: string = <string>request.headers["refresh-token"];

    if(!auth_token) return response.status(401).json(toObj(response,{Error: customError.tokenRequired}));
    if(!refresh_token) return response.status(401).json(toObj(response,{Error: customError.tokenRequired}));

    //Try to validate the token
    const auth_localPayload: (LocalPayloadInterface | Error) = await validateToken(auth_token, TokenType.Authentication);
    const refresh_localPayload: (LocalPayloadInterface | Error) = await validateToken(refresh_token, TokenType.Refresh);

    if(auth_localPayload instanceof Error) {
      return response.status(401).json(toObj(response,{Error: auth_localPayload.message}));
    } 

    if(refresh_localPayload instanceof Error) {
      return response.status(401).json(toObj(response,{Error: refresh_localPayload.message}));
    }

    if(auth_localPayload.user_id == refresh_localPayload.user_id) {
        
      let new_payload: JWTPayloadInterface = {user_id: refresh_localPayload.user_id};

      const new_security_token = jwt.sign(new_payload,<jwt.Secret>(process.env.JWT_SECURITY_TOKEN_SECRET), {
        expiresIn: String(process.env.JWT_SECURITY_EXPIRES_IN)
      });
      
      console.info("User " + refresh_localPayload.name + " (" + refresh_localPayload.user_id + ") has requested a security-token!");
      return response.header('security-token',new_security_token).status(200).json(toObj(response));
    }

    return response.status(401).json(toObj(response,{Error: customError.invalidToken}));
  }
  public static async getUserIDFromToken(request: Request, response: Response) {
  
    //get and validate JWT Payload
    const userPayload: LocalPayloadInterface = response.locals.userPayload;

    if(!userPayload) {
        console.error("Controller Error: Missing jwtpayload");
        return response.status(500).json(toObj(response));
    }

    console.info("User " + userPayload.name + "(" + userPayload.user_id + ") verified auth-token")
    return response.status(200).json(toObj(response,{user_id: userPayload.user_id}));
  }
}

export default AuthController;