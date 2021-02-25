export const patch_calendar: Object = {
    tags: ["Calendar"],
    summary: "Update an existing calendar",
    description: "Changes the calendar informations of the given calendar_id.",
    operationId: "editCalendar",
    parameters: [{
        in: "path",
        name: "calendar_id",
        description: "The ID of the calendar entry.",
        schema: {
            type: "string"
        },
        required: true
    },{
        in: "header",
        name: "auth-token",
        schema: {
            type: "string",
            format: "jwt"
        },
        required: true
    }],
    requestBody: {
        description: "Calendar informations to change",
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                        },
                        can_join: {
                            type: "boolean",
                        },
                        password: {
                            type: "string",
                        }
                    }
                },
            }
        }
    },
    responses: {
        200: {
            description: "OK. Successfully updated!",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        403: {
            description: "Forbidden. Authorization is not sufficient to change the calendar"
        },
        404: {
            description: "Not Found. Calendar not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}