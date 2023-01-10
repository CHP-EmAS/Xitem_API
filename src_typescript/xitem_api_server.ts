import dotenv from 'dotenv';
dotenv.config();

import api from "./api";

const PORT = process.env.PORT || 3000;
export const API_VERSION = process.env.npm_package_version || "Unknown";
export const MIN_APP_VERSION = "1.3.0"

console.log("########################## " + process.env.APP_NAME + " API Version: " + API_VERSION + " ##########################");
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
console.log((process.env.JWT_DELETE_ACCOUNT_SECRET  ? "✓" : "X") + " JWT_DELETE_ACCOUNT_SECRET exp: " + process.env.JWT_DELETE_ACCOUNT_EXPIRES_IN);
console.log(" ");

console.log("Starting Server...")
api.start(String(PORT)).catch((error) =>
    console.log("API crashed with Error:\n" + error)
)