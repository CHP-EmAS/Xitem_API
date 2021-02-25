import dotenv from 'dotenv';
dotenv.config();

import { database } from "./config/database";
import api from "./api";
import MailController from './controllers/mailController';
import { Server } from 'http';
import WebConsole, {validateUserAccess} from "./config/web_console"

const PORT = process.env.PORT || 3000;
const VERSION = "0.8.10";

console.log("########################## " + process.env.APP_NAME + " API Version: " + VERSION + " ##########################");
console.log(" ");
console.log("Starting " + process.env.APP_NAME + " API on Port: " + PORT + " ...");
console.log(" ");
console.log(((process.env.CONSOLE_LOG_REQUESTS == 'true')   ? "✓" : "X" ) + " Request Logging");
console.log(((process.env.SEQUELIZE_LOG == 'true')          ? "✓" : "X" ) + " Sequelize Logging");
console.log(" ");
console.log("Checking Tokens Secrets ...");
console.log((process.env.JWT_AUTH_TOKEN_SECRET      ? "✓" : "X") + " JWT_AUTH_TOKEN_SECRET     exp: " + process.env.JWT_AUTH_EXPIRES_IN);
console.log((process.env.JWT_REFRESH_TOKEN_SECRET   ? "✓" : "X") + " JWT_REFRESH_TOKEN_SECRET  exp: " + process.env.JWT_REFRESH_EXPIRES_IN);
console.log((process.env.JWT_SECURITY_TOKEN_SECRET  ? "✓" : "X") + " JWT_SECURITY_TOKEN_SECRET exp: " + process.env.JWT_SECURITY_EXPIRES_IN);
console.log((process.env.JWT_EMAIL_SECRET           ? "✓" : "X") + " JWT_EMAIL_SECRET          exp: " + process.env.JWT_EMAIL_EXPIRES_IN);
console.log((process.env.JWT_RECOVERY_SECRET        ? "✓" : "X") + " JWT_RECOVERY_SECRET       exp: " + process.env.JWT_RECOVERY_EXPIRES_IN);
console.log((process.env.JWT_INVITATION_SECRET      ? "✓" : "X") + " JWT_INVITATION_SECRET     exp: depending on request");
console.log((process.env.JWT_DELETE_ACCOUNT_SECRET  ? "✓" : "X") + " JWT_DELETE_ACCOUNT_SECRET exp: " + process.env.JWT_DELETE_ACCOUNT_IN);
console.log(" ");
console.log("\nConnecting to Postgresql on DB: " + process.env.PG_USER + "@" + process.env.PG_HOST + ":" + process.env.PG_PORT +  "/" + process.env.PG_DATABASE + " >> Schema: " + process.env.PG_SCHEMA + " ...");

database.authenticate().then(async connection => {
    MailController.init()
    
    const httpServer: Server = api.listen(PORT, () => console.log(process.env.APP_NAME + " API started on Port: " + PORT + "!"));

    const webConsole = new WebConsole(httpServer, "/logging", validateUserAccess)
    webConsole.start();
})
.catch((err: string) => {
    console.log('Critical: Cannot connect to Postgresql!\n' + err + "\nDB: " + process.env.PG_USER + "@" + process.env.PG_HOST + ":" + process.env.PG_PORT +  "/" + process.env.PG_DATABASE + " >> Schema: " + process.env.PG_SCHEMA);
})

