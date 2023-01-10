import { Model, DataTypes} from "sequelize";

import { database, databaseSchema } from "../config/database";

import { UserModel } from "./User";
import { CalendarModel } from "./Calendar";
import { NoteModel } from "./Notes";

//------- Class for User Model-------//
export class EventModel extends Model {
    public event_id!: number; 
    public begin_date!: Date;
    public end_date!: Date;
    public title!: string;
    public description!: (string | null);
    public color!: number;
    public created_by_user!: (string | null);
    public associated_calendar!: string;
    public daylong!: boolean;
    public pinned_note!: (number | null);
    public createdBy!: UserModel;
    public calendarObject!: CalendarModel;
    public noteObject!: NoteModel;
    public readonly creation_date!: Date;
}

//------- Init Sequelize-Model -------//
EventModel.init(
{
    event_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    begin_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    color: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 4294951175
    },
    created_by_user: {
        type: DataTypes.UUIDV4,
        allowNull: true,
        defaultValue: null
    },
    associated_calendar: {
        type: DataTypes.UUIDV4,
        allowNull: false,
    },
    daylong: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pinned_note: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null
    },
},
{
    timestamps: true, 
    createdAt: 'creation_date', 
    updatedAt: false,
    freezeTableName: true,
    tableName: 'events',
    sequelize: database,
    schema: databaseSchema
});

EventModel.belongsTo(UserModel, {foreignKey: 'created_by_user', targetKey: 'user_id', as: 'createdBy'});
EventModel.belongsTo(CalendarModel, {foreignKey: 'associated_calendar', targetKey: 'calendar_id', as: 'calendarObject'});
EventModel.belongsTo(NoteModel, {foreignKey: 'pinned_note', targetKey: 'note_id', as: 'noteObject'});