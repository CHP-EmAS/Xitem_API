import { Request, Response, NextFunction } from "express";

import toObj from "../config/responseStandart"

import { UserModel } from "../models/User";
import { UserRoleModel } from "../models/UserRole"
import { LocalPayloadInterface } from "../validation/interfaces";

export const enum Roles {
  SystemAdministrator = "sysadmin",
  Administrator = "admin",
  Verified = "verified",
  Unverified = "unverified",
  Readonly = "readonly",
}

export const enum Comparisons {
  isGreaterThan = "greater than",
  isLessThan = "less than",
  isGreaterOrEqualThan = "greater or equal than",
  isLessOrEqualThan = "less or equal than"
}

export class RoleCheck{

  private static cachedRoles: Map<String,UserRoleModel> = new Map<String,UserRoleModel>();

  private static async getRole(roleName: string): Promise<(UserRoleModel | null)> {
    //Get role from cache or database
    try {
      
      if(this.cachedRoles.has(roleName)) {
        const role: (UserRoleModel | undefined) = this.cachedRoles.get(roleName);

        if(role == undefined) return null;
        return role;
      }
        
      const requestedRole: (UserRoleModel | null) = await UserRoleModel.findByPk(roleName);

      if(requestedRole != null) {
        this.cachedRoles.set(roleName,requestedRole);
      }

      return requestedRole;

    } catch (error) {

        console.error(error);
        return null;

    }
}

  private static async getUserRole(user_id: string): Promise<(UserRoleModel | null)> {
      //Get user role from the database
      try {
          
        const user = await UserModel.findOne({attributes: [], where: {user_id: user_id}, include: [{model: UserRoleModel, as: 'roleObject'}]});

        if(!user) return null;
        return user.roleObject;

      } catch (error) {

          console.error(error);
          return null;

      }
  }

  public static isEqualTo(roles: Array<Roles>){
    return async (request: Request, response: Response, next: NextFunction) => {
      const userPayload: LocalPayloadInterface = response.locals.userPayload;

      if(!userPayload) {
        console.error("Error: Missing userPayload in roleCheck, do 'authProtected' before roleCheck!");
        return response.status(500).json(toObj(response));
      }
      
      //search user role ins local payload
      let userRole: (UserRoleModel | null);

      if(!userPayload.role) {
        console.warn("User role was not found in local payload! The role is only queried from the database");
        userRole = await this.getUserRole(userPayload.user_id);
      } 
      else userRole = userPayload.role;
      
      if(!userRole) {
        console.error("Role of the user was not found neither in the payload nor in the database!")
        return response.status(403).json(toObj(response));
      }

      //Check if array of authorized roles includes the user's role
      if (roles.indexOf(<Roles>userRole.role_name) > -1) next();
      else {
        console.info("User " + userPayload.name + "(" + userPayload.user_id + ")[" + userPayload.role.role_name + "] is not authorized to perform this operation. Required roles: " + roles + ".")
        response.status(403).json(toObj(response));
      }
    };
  };

  public static compare(comparison: Comparisons, role: Roles){
    return async (request: Request, response: Response, next: NextFunction) => {
      
      const userPayload: LocalPayloadInterface = response.locals.userPayload;

      if(!userPayload) {
        console.error("Error: Missing userPayload in roleCheck, set 'authProtected' before roleCheck!");
        return response.status(500).json(toObj(response));
      }
      
      //search user role ins local payload
      let userRole: (UserRoleModel | null);

      if(!userPayload.role) {
        console.warn("WARNING: User role was not found in local payload! The role is only queried from the database, but is not verified. Uncertain!");
        userRole = await this.getUserRole(userPayload.user_id); //not found -> get from db 
      } 
      else userRole = userPayload.role;
      
      if(!userRole) {
        console.error("Role of the user was not found neither in the payload nor in the database!")
        return response.status(403).json(toObj(response));
      }

      //get requested role object
      const requestedRole: (UserRoleModel | null) = await this.getRole(role.toString());
      if(!requestedRole) return response.status(500).json(toObj(response));
    
      //Check if array of authorized roles includes the user's role
      switch(comparison) { 
        case Comparisons.isGreaterThan: { 
          if(userRole.hierarchy_level > requestedRole.hierarchy_level) return next();
          break;
        } 
        case  Comparisons.isLessThan: { 
          if(userRole.hierarchy_level < requestedRole.hierarchy_level) return next();
          break;
        }
        case Comparisons.isGreaterOrEqualThan: {
          if(userRole.hierarchy_level >= requestedRole.hierarchy_level) return next(); 
          break;
        }
        case Comparisons.isLessOrEqualThan: {
          if(userRole.hierarchy_level <= requestedRole.hierarchy_level) return next();
          break;
        }
        default: {
          console.error("Unknown comperison: " + comparison)
          return response.status(500).json(toObj(response));
        }
      } 

      console.info("User " + userPayload.name + "(" + userPayload.user_id + ")[" + userPayload.role.role_name + "] is not authorized to perform this operation. Required: " + comparison + " " + role + ".\n" + request.method + " " + request.originalUrl)
      return response.status(403).json(toObj(response));
    };
  };
}