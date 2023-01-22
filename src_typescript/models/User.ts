import { Model, DataTypes} from "sequelize";
import bcrypt from "bcryptjs"

import { database, databaseSchema } from "../config/database";
import { UserRoleModel } from "./UserRole";
import { Roles } from "../middlewares/checkRole";

//------- Class for User Model-------//
export class UserModel extends Model {
    public user_id!: string;
    public name!: string;
    public email!: string;
    public birthday!: ( Date | null );
    public active!: boolean;
    public role!: string;
    public roleObject!: UserRoleModel;
    public profile_picture_hash!: string;
    public readonly registered_at!: Date;

    private hash_passwd!: string;
    public password_changed_at!: Date;

    hashPassword(password: string): void {
        const salt: string = bcrypt.genSaltSync(10);
        this.hash_passwd = bcrypt.hashSync(password, salt);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
        return bcrypt.compareSync(unencryptedPassword, this.hash_passwd);
    }
}

//------- Init Sequelize-Model -------//
UserModel.init(
{
    user_id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: Roles.Unverified
    },
    profile_picture_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    hash_passwd: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    password_changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now()
    },
},
{
    timestamps: true, 
    createdAt: 'registered_at', 
    updatedAt: false,
    freezeTableName: true,
    tableName: 'users',
    sequelize: database,
    schema: databaseSchema
});

UserModel.belongsTo(UserRoleModel, {foreignKey: 'role', targetKey: 'role_name', as: 'roleObject'});