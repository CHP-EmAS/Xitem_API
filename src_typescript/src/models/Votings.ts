import { Model, DataTypes} from "sequelize";

import { database, databaseSchema } from "../config/database";

//------- Class for User Model-------//
export class CalendarVotingModel extends Model {
    public voting_id!: number; 
    public calendar_id!: string;
    public owner_id!: string;
    public title!: string;
    public abstention_allowed!: Boolean;
    public multiple_choice!: Boolean;
    public readonly creation_date!: Date;
    public choices!: Array<VotingChoiceModel>;
}

//------- Init Sequelize-Model -------//
CalendarVotingModel.init(
{
    voting_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    calendar_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    owner_id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    abstention_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    multiple_choice: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
},
{
    timestamps: true, 
    createdAt: 'creation_date', 
    updatedAt: false,
    freezeTableName: true,
    tableName: 'calendar_votings',
    sequelize: database,
    schema: databaseSchema,
    underscored: true
});

export class VotingChoiceModel extends Model {
    public choice_id!: number;
    public voting_id!: number; 
    public date!: ( Date | null );
    public comment!: ( string | null );
    public votingObject!: CalendarVotingModel;
    public votes!: Array<VotingUserLinkModel>
}

//------- Init Sequelize-Model -------//
VotingChoiceModel.init(
{
    choice_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    voting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    comment: {
        type: DataTypes.STRING(40),
        allowNull: true,
    },
},
{
    timestamps: false, 
    freezeTableName: true,
    tableName: 'calendar_voting_choices',
    sequelize: database,
    schema: databaseSchema,
    underscored: true
});

VotingChoiceModel.belongsTo(CalendarVotingModel, {foreignKey: 'voting_id', targetKey: 'voting_id', as: 'votingObject'});
CalendarVotingModel.hasMany(VotingChoiceModel, {foreignKey: 'voting_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'choices'})

export class VotingUserLinkModel extends Model {
    public choice_id!: number;
    public user_id!: string;
    public choiceObject!: VotingChoiceModel;
}

//------- Init Sequelize-Model -------//
VotingUserLinkModel.init(
{
    choice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
},
{
    timestamps: false, 
    freezeTableName: true,
    tableName: 'voting_user_lnks',
    sequelize: database,
    schema: databaseSchema,
    underscored: true
});

VotingUserLinkModel.belongsTo(VotingChoiceModel, {foreignKey: 'choice_id', targetKey: 'choice_id', as: 'choiceObject'});
VotingChoiceModel.hasMany(VotingUserLinkModel, {foreignKey: 'choice_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'votes'})