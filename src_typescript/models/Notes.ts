import { Model, DataTypes} from "sequelize";

import { database, databaseSchema } from "../config/database";
import { CalendarModel } from "./Calendar";
import { UserModel } from "./User";

//------- Class for Note Model-------//
export class NoteModel extends Model {
    public note_id!: number;
    public associated_calendar!: string;
    public title!: string;
    public color!: number;
    public pinned!: boolean;
    public content!: string;
    public owner_id!: (string | null);
    public readonly creation_date!: Date;
    public readonly modification_date!: Date;
    public createdBy!: UserModel;
    public calendarObject!: CalendarModel;
}

//------- Init Sequelize-Model -------//
NoteModel.init(
{
    note_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    associated_calendar: {
        type: DataTypes.UUIDV4,
        primaryKey: false,
        allowNull: false
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    color: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 13
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    owner_id: {
        type: DataTypes.UUIDV4,
        allowNull: true,
        defaultValue: null
    }
},
{
    timestamps: true, 
    createdAt: 'creation_date', 
    updatedAt: 'modification_date',
    freezeTableName: true,
    tableName: 'notes',
    sequelize: database,
    schema: databaseSchema
});

NoteModel.belongsTo(UserModel, {foreignKey: 'owner_id', targetKey: 'user_id', as: 'createdBy'});
NoteModel.belongsTo(CalendarModel, {foreignKey: 'associated_calendar', targetKey: 'calendar_id', as: 'calendarObject'});

