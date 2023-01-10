export const post_reset_password: Object =  {
    tags: ["Authentication"],
    summary: "Reset the Password of a User with recovery_key.",
    description: "In order to reset the password of the user, the recovery_key is required.",
    operationId: "resetPassword",
    requestBody: {
        description: "JSON Object containing the required data for reseting the password",
        required: true,
        content: {
            "application/json": {
                schema: {
                    title: "Reset Password Schema ",
                    type: "object",
                    properties: {
                        recovery_key: {
                            type: "string",
                            format: "jwt"
                        },
                        new_password: {
                            type: "string",
                            format: "password"
                        },
                        repeat_password:{
                            type: "string",
                            format: "password"
                        }
                    },
                    required: ["recovery_key", "new_password", "repeat_password"],
                }
            }
        }
    },
    responses: {
        200: {
          description: "OK. Password successfully changed!",
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
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}