import { Router} from "express";

import VotingController from "../controllers/votingController";

import { validatePathParameter }  from "../middlewares/validatePathParameter";
import { Roles , Comparisons, roleCheck } from "../middlewares/checkRole";

// ######### /calendar/{calendar_id}/event route ######### //
// >> user jwt checked

const router = Router({ mergeParams: true });

//calendar voting routes
router.post("/", VotingController.createVoting); //create voting
router.get("/", VotingController.getCalendarVotings); //get all votings

router.delete("/:voting_id", VotingController.deleteVoting); //delete voting
router.get("/:voting_id", VotingController.getSingleCalendarVoting); //get single voting

//vote routes
router.post("/:voting_id/vote", VotingController.vote)

export default router;