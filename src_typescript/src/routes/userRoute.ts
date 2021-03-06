import { Router} from "express";

import UserController from "../controllers/userController";

import { authProtected, highSecurity } from "../middlewares/validateJWT";
import { Roles, roleCheck } from "../middlewares/checkRole";
import { validatePathParameter } from "../middlewares/validatePathParameter";

// ######### /user/{user_id} route ######### //

const router = Router({ mergeParams: true });

//user instance routes
router.get("/", [authProtected, validatePathParameter], UserController.getUserInfo);
router.patch("/", [authProtected, validatePathParameter], UserController.patchUser);
router.delete("/", [authProtected, validatePathParameter, roleCheck.isEqualTo([Roles.SystemAdministrator])], UserController.deleteUserByAdmin);

//send account deletion mail
router.post("/deletion_request", [authProtected, highSecurity, validatePathParameter], UserController.requestAccountDeletion)

//user calendar instances
router.get("/calendars", [authProtected, validatePathParameter], UserController.getAssociatedCalendars);

router.post("/infomail", [authProtected, validatePathParameter], UserController.generateUserInformationEmail);

//user avatar routes
router.put("/avatar", [authProtected, validatePathParameter] , UserController.changeProfilePicture);
router.get("/avatar", [validatePathParameter], UserController.getProfilePicture);

export default router;