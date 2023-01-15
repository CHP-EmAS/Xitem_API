import { Model, DataTypes} from "sequelize";

import { database, databaseSchema } from "../config/database";

import { CalendarModel } from "./Calendar";

//------- Class for User Model-------//
export class CalendarUserLinkModel extends Model {
    public calendar_id!: string; 
    public user_id!: string;
    public is_owner!: boolean
    public can_create_events!: boolean;
    public can_edit_events!: boolean;
    public color!: number;
    public icon!: number;
    public calendarObject!: CalendarModel;
}

//------- Init Sequelize-Model -------//
CalendarUserLinkModel.init(
{
    calendar_id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    is_owner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_create_events: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_edit_events: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    color: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 13
    },
    icon: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    }
},
{
    timestamps: false, 
    freezeTableName: true,
    tableName: 'calendar_user_lnks',
    sequelize: database,
    schema: databaseSchema,
    underscored: true
});

CalendarUserLinkModel.belongsTo(CalendarModel, {foreignKey: 'calendar_id', targetKey: 'calendar_id', as: 'calendarObject'});