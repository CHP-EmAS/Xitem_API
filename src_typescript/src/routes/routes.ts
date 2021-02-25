import { Router, Request, Response, NextFunction} from "express";

import toObj from "../config/responseStandart";

import { authProtected } from "../middlewares/validateJWT";
import { Roles , Comparisons, roleCheck } from "../middlewares/checkRole";

import calendar from "./calendarRoute";
import auth from "./authRoute";
import user from "./userRoute";
import filter from "./filterRoute";
import statistic from "./statisticRoute";
import HolidayController from "../controllers/holidayController";
import CalendarController from "../controllers/calendarController";
import UserController from "../controllers/userController";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user/:user_id", user);

//delete account via deltion key
routes.delete("/user", UserController.accountDeletion)

routes.use("/calendar", [authProtected], calendar);
routes.post("/invitation", [authProtected, roleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Verified)], CalendarController.verifyInvitationToken);

routes.use("/filter", filter);
routes.use("/statistic", [authProtected, roleCheck.isEqualTo([Roles.SystemAdministrator, Roles.Administrator])], statistic);
routes.get("/holidays/:year/:state_code", HolidayController.getHolidays);

routes.get("/", function(request: Request, response: Response) {
    const welcomeMsg = { API_Name: process.env.APP_NAME + " API" , Version: "0.9.2" , Documentation: request.headers.host + "/documentation"};
    response.status(200).json(toObj(response,welcomeMsg));
});

routes.use("*", function(request: Request, response: Response) {
    response.status(403).json(toObj(response));
});

export default routes;