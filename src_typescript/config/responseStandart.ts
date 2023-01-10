const status = require('http-status-code');
import { Response } from "express";

const responseToStatusObject = (response: Response, message?: object): object => {
    if(!message) message = {};

    const status_obj: object = { Status: { Code: response.statusCode, Message: status.getMessage(response.statusCode) } };

    return Object.assign(status_obj, message);
}

export default responseToStatusObject;