export const post_send_verification: Object = {
    tags: ["Authentication"],
    summary: "Send a verification email.",
    description: "Sends a verification email to the user which is stored in the user-token. The user must be unverified.",
    operationId: "sendVerification",
    requestBody: {
        description: "JSON Object containing the required user data for registration",
        required: true,
        content: {
            "application/json": {
                schema: {
                    title: "Registration Schema ",
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            format: "email"
                        },
                        name: {
                            type: "string"
                        },
                        birthday: {
                            type: "string",
                            format: "date"
                        },
                    },
                    required: ["email", "name"],
                }
            }
        }
    },
    responses: {
        200: {
          description: "OK. Email successfully send!",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}