export const post_verify: Object = {
    tags: ["Authentication"],
    summary: "Verification of a user using the token sent by email",
    description: "The verification requires the key which was sent to the user by email. The user to be verified must be unverified.",
    operationId: "verifyEmail",
    requestBody: {
        description: "JSON Object containing the required user data for registration",
        required: true,
        content: {
            "application/json": {
                schema: {
                    title: "Registration Schema ",
                    type: "object",
                    properties: {
                        validation_key: {
                            type: "string",
                        },
                        password: {
                            type: "string",
                            format: "password"
                        },
                        repeat_password:{
                            type: "string",
                            format: "password"
                        }
                    },
                    required: ["validation_key", "password", "repeat_password"],
                }
            }
        }
    },
    responses: {
        201: {
          description: "Created. User successfully verified and saved!",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}