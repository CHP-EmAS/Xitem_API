export const post_login: Object =  {
    tags: ["Authentication"],
    summary: "Login a User with nickname and password",
    description: "If the login is sucessfull, the response will contain the user_id of the logged in user and a JWT to authenticate this user for requests that need a valid user-token. The JWT expires after one hour. Every request that needs a user-token will generate a new token, valid for another hour.",
    operationId: "login",
    requestBody: {
        description: "JSON Object containing the required login data",
        required: true,
        content: {
            "application/json": {
                schema: {
                    title: "Login Schema",
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                        },
                        password: {
                            type: "string",
                        }
                    },
                    required: ["email", "password"],
                }
            }
        }
    },
    responses: {
        200: {
          description: "OK. Successfully logged in!",
          content:{
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        user_id: {
                            type: "string",
                            format: "uuid",
                            description: "ID of the logged in user."
                        }
                    }
                }
            }
          },
          headers: {
            "auth-token": {
                schema: {
                    type: "string",
                    format: "jwt"
                },
                description: "JWT to authenticate requests with the registered user. Has a validity period of one hour."
            },
            "refresh-token": {
                schema: {
                    type: "string",
                    format: "jwt"
                },
                description: "JWT to refresh an expired auth-token. Has a validity period of 21 days."
            }
          }
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
            description: "Unauthorized. Nickname or password is incorrect!",
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}