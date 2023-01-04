import { Request, Response } from "express";
import Sequelize  from "sequelize";

import toObj from "../config/responseStandart"
import * as customError from "../config/errorCodes"

import CalendarController from "./calendarController";

import { CalendarVotingModel, VotingChoiceModel, VotingUserLinkModel } from "../models/Votings";

import { LocalPayloadInterface, CreateVotingInterface, VotingInterface, VotingChoiceInterface, VoteInterface } from "../validation/interfaces"
import { createVotingSchema, voteSchema } from "../validation/votingValidationSchemas"



class VotingController {

    //GET all Votings Info (JWT)
    public static async getCalendarVotings(request: Request, response: Response) {
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requested_calendar_id = request.params.calendar_id;

        //check if user is member of requested calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        try{
            //get all votings where calendar_id is matching the request
            const result: CalendarVotingModel[] = await CalendarVotingModel.findAll({
                where: {
                    calendar_id: requested_calendar_id,  
                },
                include: [{
                    model: VotingChoiceModel, 
                    as: 'choices', 
                    include: [{
                        model: VotingUserLinkModel,
                        as: 'votes'
                    }]
                }]
            });

            let votingArray: Array<VotingInterface> = new Array<VotingInterface>();

            await Promise.all(result.map(async (voting) => {

                let choicesArray: Array<VotingChoiceInterface> = new Array<VotingChoiceInterface>();

                let userWhoHaveVotedSet: Set<String> = new Set<String>();
                let userVotedForSet: Array<number> = new Array<number>();

                voting.choices.forEach(async (choice) => {
                    const newChoice: VotingChoiceInterface = {
                        choice_id: choice.choice_id,
                        date: choice.date,
                        comment: choice.comment,
                        amountVotes: choice.votes.length
                    };

                    choice.votes.forEach((link) => {
                        if(link.user_id == userPayload.user_id) {
                            userVotedForSet.push(link.choice_id);
                        }

                        userWhoHaveVotedSet.add(link.user_id);
                    });
                    
                    choicesArray.push(newChoice);
                });

                const newVoting: VotingInterface = {
                    voting_id: voting.voting_id, owner_id: voting.owner_id, 
                    title: voting.title, abstention_allowed: voting.abstention_allowed, 
                    multiple_choice: voting.multiple_choice, numberUsersWhoHaveVoted: userWhoHaveVotedSet.size,
                    userHasVoted: (userWhoHaveVotedSet.has(userPayload.user_id)),userVotedFor: userVotedForSet, 
                    choices: choicesArray,creation_date: voting.creation_date
                };

                votingArray.push(newVoting);

            }));

            return response.status(200).json(toObj(response,{Votings: votingArray}));

        } catch ( error ) {
            console.error(error);
            return response.status(500).json(toObj(response));
        }

    }

    //GET single Voting Info (JWT)
    public static async getSingleCalendarVoting(request: Request, response: Response) {
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requested_calendar_id = request.params.calendar_id;
        const requested_voting_id = request.params.voting_id;

        //check if user is member of requested calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        try{
            //get voting where calendar_id and voting_id matching the request
            const voting: ( CalendarVotingModel | null ) = await CalendarVotingModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {calendar_id: requested_calendar_id}, 
                        {voting_id: requested_voting_id}
                    ]  
                },
                include: [{
                    model: VotingChoiceModel, 
                    as: 'choices', 
                    include: [{
                        model: VotingUserLinkModel,
                        as: 'votes'
                    }]
                }]
            });

            if(!voting) return response.status(404).json(toObj(response, {Error: customError.votingNotFound}));

            let choicesArray: Array<VotingChoiceInterface> = new Array<VotingChoiceInterface>();

            let userWhoHaveVotedSet: Set<String> = new Set<String>();
            let userVotedForSet: Array<number> = new Array<number>();

            voting.choices.forEach(async (choice) => {
                const newChoice: VotingChoiceInterface = {
                    choice_id: choice.choice_id,
                    date: choice.date,
                    comment: choice.comment,
                    amountVotes: choice.votes.length
                };

                choice.votes.forEach((link) => {
                    if(link.user_id == userPayload.user_id) {
                        userVotedForSet.push(link.choice_id);
                    }

                    userWhoHaveVotedSet.add(link.user_id);
                });
                
                choicesArray.push(newChoice);
            });

            const newVoting: VotingInterface = {
                voting_id: voting.voting_id, owner_id: voting.owner_id, 
                title: voting.title, abstention_allowed: voting.abstention_allowed, 
                multiple_choice: voting.multiple_choice, numberUsersWhoHaveVoted: userWhoHaveVotedSet.size,
                userHasVoted: (userWhoHaveVotedSet.has(userPayload.user_id)), userVotedFor: userVotedForSet,
                choices: choicesArray, creation_date: voting.creation_date
            };

            return response.status(200).json(toObj(response,{Voting: newVoting}));

        } catch ( error ) {
            console.error(error);
            return response.status(500).json(toObj(response));
        }

    }

    //POST create Voting (JWT, >= verified)
    public static async createVoting(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }

        const requestParams: CreateVotingInterface = request.body;
    
        const { error } = createVotingSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));
    
        const requested_calendar_id = request.params.calendar_id;

        //get all associated users form the calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));
        if(!isMember.can_edit_events || !isMember.is_owner) return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));

        let voting = new CalendarVotingModel();

        voting.title = requestParams.title;
    
        voting.abstention_allowed = requestParams.abstention_allowed;
        voting.multiple_choice = requestParams.multiple_choice;

        voting.calendar_id = requested_calendar_id;
        voting.owner_id = userPayload.user_id;

        let newVoting: CalendarVotingModel;

        try {
            newVoting = await voting.save();
        } catch ( error ) {
            console.error(error)
            return response.status(500).json(toObj(response));
        }

        let errorCreatingChoices: Boolean = false;

        await Promise.all(requestParams.choices.map(async (newChoice) => {
            let choice = new VotingChoiceModel();

            choice.date = newChoice.date;
            choice.comment = newChoice.comment;

            choice.voting_id = newVoting.voting_id;

            await choice.save()
                .catch((err: Error) => {
                    errorCreatingChoices = true;
                    console.error(err); 
                });
        }));

        if(voting.abstention_allowed) {
            let abstention_choice = new VotingChoiceModel();

            abstention_choice.date = null;
            abstention_choice.comment = "abstention";

            abstention_choice.voting_id = newVoting.voting_id;

            abstention_choice.save()
                .catch((err: Error) => {
                    errorCreatingChoices = true;
                    console.error(err); 
                });
        }

        if(errorCreatingChoices) {
            await newVoting.destroy();
            return response.status(500).json(toObj(response));
        }
            
        return response.status(201).json(toObj(response,{ voting_id: newVoting.voting_id }));
    }

    //DELETE delete Voting (JWT)
    public static async deleteVoting(request: Request, response: Response) {
         //get and validate JWT Payload
         const userPayload: LocalPayloadInterface = response.locals.userPayload;

         if(!userPayload) {
             console.error("Controller Error: Missing userPayload");
             return response.status(500).json(toObj(response));
         }
     
         //get calendar_id and voting_id given in path
         const requested_calendar_id = request.params.calendar_id;
         const requested_voting_id = request.params.voting_id;
  
         try{
             //Get voting from database
             let voting: (CalendarVotingModel | null) = await CalendarVotingModel.findByPk(requested_voting_id);
             if(!voting) return response.status(404).json(toObj(response, {Error: customError.votingNotFound}));
 
             //check if user is member of requested calendar
             const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
             if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

             if(userPayload.user_id != voting.owner_id){
                 if(!isMember.is_owner) {
                     return response.status(403).json(toObj(response, {Error: customError.insufficientPermissions}));
                 }
             }
 
             await voting.destroy();
 
             return response.status(200).json(toObj(response,{Info: "Voting deleted"}));
 
         } catch ( error ) {
             console.log(error);
             return response.status(500).json(toObj(response));
         }
    }

    //POST add Votingchoice (JWT, >= verified)
    public static async vote(request: Request, response: Response) {
        //get and validate JWT Payload
        const userPayload: LocalPayloadInterface = response.locals.userPayload;

        if(!userPayload) {
            console.error("Controller Error: Missing userPayload");
            return response.status(500).json(toObj(response));
        }


        //get requested ids
        const requested_calendar_id = request.params.calendar_id;
        const requested_voting_id = request.params.voting_id;
        
        //get and validate selected choices
        const requestParams: VoteInterface = request.body;
    
        const { error } = voteSchema.validate(requestParams);
        if(error) return response.status(400).json(toObj(response,{Error: error.message}));

        //check if user is member in requested calendar
        const isMember = await CalendarController.isCalendarMember(requested_calendar_id, userPayload.user_id);
        if(isMember == null) return response.status(403).json(toObj(response, {Error: customError.accessForbidden}));

        try{
            //find requested voting
            const voting: (CalendarVotingModel | null) = await CalendarVotingModel.findOne({
                where: {
                    [Sequelize.Op.and]: [
                        {calendar_id: requested_calendar_id}, 
                        {voting_id: requested_voting_id}
                    ]
                },
                include: [{
                    model: VotingChoiceModel, 
                    as: 'choices', 
                    include: [{
                        model: VotingUserLinkModel,
                        as: 'votes'
                    }]
                }]
            })
            if(!voting) return response.status(404).json(toObj(response, {Error: customError.votingNotFound}));
            
            let found_voting_choices: number = 0;
            let user_has_voted: Boolean = false;

            voting.choices.forEach((voting_choice) => {
                if(requestParams.choice_ids.includes(voting_choice.choice_id))
                    found_voting_choices++;

                voting_choice.votes.forEach((vote_link) => {
                    if(vote_link.user_id == userPayload.user_id) {
                        user_has_voted = true;
                    }
                });
            });

            //check if user already voted
            if(user_has_voted)
                return response.status(400).json(toObj(response, {Error: customError.alreadyVoted}));

            //check if multiple choice is valid
            if(!voting.multiple_choice && requestParams.choice_ids.length > 1)
                return response.status(400).json(toObj(response, {Error: customError.noMultipleChoiceEnabled}));

            //check if all selected choices are part of voting
            if(found_voting_choices < requestParams.choice_ids.length) 
                return response.status(404).json(toObj(response, {Error: customError.choiceNotFound}));

            //create vote link
            await Promise.all(requestParams.choice_ids.map(async (requested_choice) => {
                let vote = new VotingUserLinkModel();

                vote.choice_id = requested_choice;
                vote.user_id = userPayload.user_id;
                
                await vote.save();
            }));

            return response.status(201).json(toObj(response));
        } catch ( error ) {
            console.error(error);
            return response.status(500).json(toObj(response));
        }
    }

}

export default VotingController;