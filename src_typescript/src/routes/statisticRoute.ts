import { Router } from "express";

import StatisticController from "../controllers/statisticController"

import { authProtected } from "../middlewares/validateJWT";
import { Roles , Comparisons, roleCheck } from "../middlewares/checkRole";

// ######### /statistic route -> JWT -- System Administrator/ Administrator ######### //

const router = Router();

router.get("/users", [authProtected, roleCheck.compare(Comparisons.isGreaterOrEqualThan, Roles.Administrator)], StatisticController.getUserStatistics);
//router.get("/calenders", [checkJwt, roleCheck.isEqualTo([Roles.SystemAdministrator])], StatisticController);
//router.get("/server", [checkJwt, roleCheck.isEqualTo([Roles.SystemAdministrator])] , StatisticController);

export default router;