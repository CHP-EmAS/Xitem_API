import { Router } from "express";
import FilterController from "../controllers/filterController";

import { validatePathParameter }  from "../middlewares/validatePathParameter";
import { authProtected } from "../middlewares/validateJWT";

// ######### /filter route ######### //

const router = Router();

//filter user
router.get("/calendar/:calendar_id/period", [authProtected, validatePathParameter], FilterController.getEventsPeriod);

export default router;