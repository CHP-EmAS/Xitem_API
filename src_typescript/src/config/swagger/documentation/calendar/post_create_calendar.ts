export const post_create_calendar: Object = {
    tags: ["Calendar"],
    summary: "Create a brand new calendar",
    description: "In order to creaete calendar informations, the auth-token is required and the user must be verified.",
    operationId: "createCalendar",
    parameters: [{
        in: "header",
        name: "auth-token",
        schema: {
            type: "string",
            format: "jwt"
        },
        required: true
    }],
    requestBody: {
        description: "JSON Object containing the required calendar data",
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                        },
                        password: {
                            type: "string",
                        },
                        can_join: {
                            type: "boolean",
                        },
                        color: {
                            type: "number",
                            format: "integer",
                        },
                        icon: {
                            type: "number",
                            format: "integer",
                        }
                    },
                    required: ["title", "can_join", "password"],
                }
            }
        }
    },
    responses: {
        201: {
          description: "OK. Successfully created!",
          content:{
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        calendar_id: {
                            type: "number",
                            format: "integer",
                            description: "ID of the new calendar."
                        }
                    },
                }
            }
          },
          
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'.",
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}