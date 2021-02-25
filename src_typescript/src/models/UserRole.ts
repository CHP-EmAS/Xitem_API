import { Model, DataTypes} from "sequelize";

import { database, databaseSchema } from "../config/database";

//------- Class for User Model-------//
export class UserRoleModel extends Model {
    public role_name!: string; 
    public description!: string;
    public full_name!: string;
    public hierarchy_level!: number;
}

//------- Init Sequelize-Model -------//
UserRoleModel.init(
{
    role_name: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        defaultValue: "unverified"
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    hierarchy_level: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: null
    },
},
{
    timestamps: false, 
    freezeTableName: true,
    tableName: 'user_roles',
    sequelize: database,
    schema: databaseSchema,
    underscored: true
});