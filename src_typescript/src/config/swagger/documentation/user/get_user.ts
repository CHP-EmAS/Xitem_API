export const get_user: Object = {
    tags: ["User"],
    summary: "Get user data.",
    description: "In order to get the (public) user informations, the user-token is required. If the given user_id is equal to the user_id stored in the auth-token, all user data will be send as a respond (exept password).",
    operationId: "getUser",
    parameters: [{
        in: "path",
        name: "user_id",
        description: "The ID of the user entry.",
        schema: {
            type: "string",
            format: "uuid"
        },
        required: true
    },
    {
        in: "header",
        name: "auth-token",
        schema: {
            type: "string",
            format: "jwt"
        },
        required: true
    }],
    responses: {
        200: {
          description: "OK. Response Body contains the user informations",
          content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        User: {
                            type: "object",
                            properties: {
                                user_id: {type:"string",format:"uuid"},
                                name: {type:"string"},
                                email: {type:"string", format:"email", description:"(privat)"},
                                birthday: {type:"string",format:"date"},
                                registered_at: {type:"string",format:"date", description:"(privat)"},
                                roleObject: {
                                    type: "object",
                                    properties: {
                                        role: {type:"string"},
                                        description: {type:"string"}
                                    }
                                }
                            },
                            description: "User Information"
                        }
                    }
                },
            }
          },
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
            content:{
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Error: {
                                type: "string",
                                description: "Includes a description of what is wrong with the request."
                            }
                        },
                    }
                }
            }
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        404: {
            description: "Not Found. User not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}