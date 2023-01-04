import { Router } from "express";

import StatisticController from "../controllers/statisticController"

// ######### /statistic route -> JWT -- System Administrator/ Administrator ######### //

const router = Router();

router.get("/users", StatisticController.getUserStatistics);
//router.get("/calenders", [checkJwt, roleCheck.isEqualTo([Roles.SystemAdministrator])], StatisticController);
//router.get("/server", [checkJwt, roleCheck.isEqualTo([Roles.SystemAdministrator])] , StatisticController);

export default router;