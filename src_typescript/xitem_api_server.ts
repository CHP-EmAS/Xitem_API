import dotenv from 'dotenv';
dotenv.config();

import api from "./api";

const PORT = process.env.PORT || 3000;
export const API_VERSION = "1.0.1";
export const MIN_APP_VERSION = "1.3.0"

console.log("########################## Xitem API Version: " + API_VERSION + " ##########################");
console.log(" ");
console.log("Starting on Port: " + PORT + " ...");
console.log(" ");
console.log(((process.env.CONSOLE_LOG_REQUESTS == 'true')   ? "✔" : "❌" ) + " Request Logging");
console.log(((process.env.SEQUELIZE_LOG == 'true')          ? "✔" : "❌" ) + " Sequelize Logging");
console.log(" ");
console.log("Checking Tokens Secrets ...");
console.log((process.env.JWT_AUTH_TOKEN_SECRET      ? "✔" : "❌") + " JWT_AUTH_TOKEN_SECRET     exp: " + process.env.JWT_AUTH_EXPIRES_IN);
console.log((process.env.JWT_REFRESH_TOKEN_SECRET   ? "✔" : "❌") + " JWT_REFRESH_TOKEN_SECRET  exp: " + process.env.JWT_REFRESH_EXPIRES_IN);
console.log((process.env.JWT_SECURITY_TOKEN_SECRET  ? "✔" : "❌") + " JWT_SECURITY_TOKEN_SECRET exp: " + process.env.JWT_SECURITY_EXPIRES_IN);
console.log((process.env.JWT_EMAIL_SECRET           ? "✔" : "❌") + " JWT_EMAIL_SECRET          exp: " + process.env.JWT_EMAIL_EXPIRES_IN);
console.log((process.env.JWT_RECOVERY_SECRET        ? "✔" : "❌") + " JWT_RECOVERY_SECRET       exp: " + process.env.JWT_RECOVERY_EXPIRES_IN);
console.log((process.env.JWT_INVITATION_SECRET      ? "✔" : "❌") + " JWT_INVITATION_SECRET     exp: depending on request");
console.log((process.env.JWT_DELETE_ACCOUNT_SECRET  ? "✔" : "❌") + " JWT_DELETE_ACCOUNT_SECRET exp: " + process.env.JWT_DELETE_ACCOUNT_EXPIRES_IN);
console.log(" ");

console.log("Starting Server...")
api.start(String(PORT)).catch((error) =>
    console.error("API crashed with Error:\n" + error)
)
