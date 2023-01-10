import { Router} from "express";

import EventController from "../controllers/eventController";

import { validatePathParameter }  from "../middlewares/validatePathParameter";
import { Roles , Comparisons, RoleCheck } from "../middlewares/checkRole";

// ######### /calendar/{calendar_id}/event route ######### //
// >> user jwt checked

const router = Router({ mergeParams: true });

//calendar events routes
router.post("/", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan,Roles.Verified)], EventController.createEvent); //create event

router.get("/:event_id", [validatePathParameter], EventController.getEventInfo); //get event informations
router.patch("/:event_id", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan,Roles.Verified)], EventController.editEvent); //edit event
router.delete("/:event_id", [validatePathParameter], EventController.deleteEvent); //delete event

export default router;