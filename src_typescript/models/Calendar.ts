import { Model, DataTypes} from "sequelize";
import bcrypt from "bcryptjs"

import { database, databaseSchema } from "../config/database";

//------- Class for User Model-------//
export class CalendarModel extends Model {
    public calendar_id!: string;
    public calendar_name!: string;
    public can_join!: boolean;
    public raw_color_legend!: string;
    public readonly creation_date!: Date;
    private hash_passwd!: string;

    hashPassword(password: string): void {
        const salt: string = bcrypt.genSaltSync(10);
        this.hash_passwd = bcrypt.hashSync(password, salt);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
        return bcrypt.compareSync(unencryptedPassword, this.hash_passwd);
    }
}

//------- Init Sequelize-Model -------//
CalendarModel.init(
{
    calendar_id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
    },
    calendar_name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    hash_passwd: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    can_join: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    raw_color_legend: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "{}"
    },
},
{
    timestamps: true, 
    createdAt: 'creation_date', 
    updatedAt: false,
    freezeTableName: true,
    tableName: 'calendars',
    sequelize: database,
    schema: databaseSchema
});

