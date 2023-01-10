import { Router } from "express";

import CalendarController from "../controllers/calendarController";

import event  from "./eventRoute";
import note  from "./noteRoute";

import { Roles , Comparisons, RoleCheck } from "../middlewares/checkRole";
import { validatePathParameter }  from "../middlewares/validatePathParameter";
import { highSecurity }  from "../middlewares/validateJWT";

// ######### /calendar route ######### //
// >> user jwt checked

const router = Router();

//calendar instance routes
router.get("/:calendar_id", [validatePathParameter], CalendarController.getCalendarInfo); //get calendar informations
router.post("/", [RoleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], CalendarController.createCalendar); //create calendar
router.patch("/:calendar_id", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], CalendarController.editCalendar); //edit calendar
router.delete("/:calendar_id", [highSecurity, validatePathParameter], CalendarController.deleteCalendar); //delete calendar

//calendar event routes
router.use("/:calendar_id/event", event)

//calendar voting routes
//router.use("/:calendar_id/voting", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], voting)

//calendar note routes
router.use("/:calendar_id/note", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], note)

//calendar user routes
router.get("/:calendar_id/user", [validatePathParameter], CalendarController.getAllAssociatedUsers); //get all associated users
router.post("/:calendar_name/user", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], CalendarController.addAssociatedUser); //add associated user

router.patch("/:calendar_id/layout", [validatePathParameter], CalendarController.patchCalendarLayout); //edit calendar color

router.post("/:calendar_id/invitation", [highSecurity, validatePathParameter], CalendarController.generateInvitationToken); //generate invitation token

router.get("/:calendar_id/user/:user_id", [validatePathParameter], CalendarController.getAssociatedUser); //get specific associated user
router.patch("/:calendar_id/user/:user_id", [validatePathParameter, RoleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], CalendarController.patchAssociatedUser); //add or change a specific associated users
router.delete("/:calendar_id/user/:user_id", [highSecurity, validatePathParameter], CalendarController.removeAssociatedUser); //delete associated user

export default router;
