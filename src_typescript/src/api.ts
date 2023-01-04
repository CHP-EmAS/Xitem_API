import "reflect-metadata";

import express, {Application} from "express";
import helmet from "helmet"
import * as bodyParser from "body-parser";

import routes from "./routes/routes";
import ErrorHandler from "./middlewares/errorHandler"
import CorsHandler from "./middlewares/corsHandler"
import LoggingHandler from "./middlewares/loggingHandler"
import {database} from "./config/database";
import MailController from "./controllers/mailController";

class API {
  private api: Application;

  constructor() {
    this.api = express(); 
    this.config();

    //Root
    this.api.use("/", routes);
  }

  public async start(port: String) {
    try {
      console.log("Connecting to Postgresql on DB: " + process.env.PG_USER + "@" + process.env.PG_HOST + ":" + process.env.PG_PORT +  "/" + process.env.PG_DATABASE + " >> Schema: " + process.env.PG_SCHEMA + " ...")
      await database.authenticate()
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Critical: Cannot connect to Postgresql!\n' + error + "\nDB: " + process.env.PG_USER + "@" + process.env.PG_HOST + ":" + process.env.PG_PORT +  "/" + process.env.PG_DATABASE + " >> Schema: " + process.env.PG_SCHEMA)
      throw Error("A connection to the database could not be established!");
    }

    MailController.init()
    this.api.listen(port, () => console.log(process.env.APP_NAME + " API started on Port: " + port + "!"));
  }

  private config(): void {
  
    //cors
    this.api.use(CorsHandler.cors);

    //helmet secure
    this.api.use(helmet())

    //bodyParser
    this.api.use(bodyParser.urlencoded({ extended: false }));
    this.api.use(bodyParser.json());

    //Pre Error Handling
    this.api.use(ErrorHandler.checkPreError);

    //logging incoming requests
    if(JSON.parse(String(process.env.CONSOLE_LOG_REQUESTS)) ) {
      this.api.use("*", LoggingHandler.requestLogging);
    }

    //Static Files
    this.api.use("/favicon.ico", express.static("static/images/favicon.ico"));
    //this.api.use("/web-console", express.static("static/html/web_console.html"));

    //Swagger
    //this.api.use("/custom.css", express.static("static/swagger_css/material.css"));

    // this.api.use("/documentation", swaggerUI.serve, swaggerUI.setup( swaggerDocs, {
    //   customSiteTitle: process.env.APP_NAME + " API Documentation",
    //   customfavIcon: "/favicon.ico",
    //   customCss: ".swagger-ui .topbar { display: none }",
    //   customCssUrl: "/custom.css"
    // }));
  }
}

export default new API();