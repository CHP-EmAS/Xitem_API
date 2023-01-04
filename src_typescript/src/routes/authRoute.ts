import { Router } from "express";
import AuthController from "../controllers/authController";

import { authProtected } from "../middlewares/validateJWT";

// ######### /auth route ######### //

const router = Router();

//Login route
router.post("/login", AuthController.login);

//Change password
router.post("/change-password", [authProtected], AuthController.changePassword);

//Send verification mail
router.post("/send-verification", AuthController.generateVerificationEmail)

//Verify user with jwt verify key
router.post("/verify", AuthController.verifyEmail)

//Send password recovery mail
router.post("/reset_password/:email", AuthController.generatePasswordRecoveryKey)

//Reset password via jwt token
router.post("/reset_password", AuthController.resetPassword)

//refresh authentication token
router.get("/refresh", AuthController.refreshAuthenticationToken);
router.get("/security", AuthController.getSecurityToken);
router.get("/id", [authProtected], AuthController.getUserIDFromToken);


export default router;