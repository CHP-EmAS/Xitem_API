import { Request, Response } from "express";

import toObj from "../config/responseStandart"
import {UserModel} from "../models/User";
import {UserRoleModel} from "../models/UserRole"

interface RoleInterface {
    Role: String,
    Amount: Number
};

interface UserStatisticInterface{
    Registered: Number,
    Roles: Array<RoleInterface>
};

class StatisticController {

    //GET User  Statistics
    public static async getUserStatistics(request: Request, response: Response) {

        try{

            let roles: Array<RoleInterface> = [];

            const userRoles: Array<UserRoleModel> = await UserRoleModel.findAll({
                attributes: ["role_name", "full_name"], 
                order: [["hierarchy_level", "ASC"]]
            });
            
            userRoles.forEach( async (element) => {
                const roleAmount: number = Number( await UserModel.count({ where: { role: element.role_name } }));
                const newRoleStat: RoleInterface = {Role: element.full_name, Amount: roleAmount};
                roles.push(newRoleStat);
            })

            const responseObject: UserStatisticInterface = {
                Registered: Number(await UserModel.count()),
                Roles: roles
            };
            
            response.status(200).json(toObj(response,{User_Statistic: responseObject}));

        } catch ( error ) {
            console.error(error);
            response.status(500).json(toObj(response));
        }
    }
}

export default StatisticController;