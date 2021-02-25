export const post_send_password_recovery: Object =  {
    tags: ["Authentication"],
    summary: "Password forgotten, sends email with token to user.",
    description: "Send a password reset token to the email address of a user, if a user is registered and verified on this email.",
    operationId: "sendResetEmail",
    parameters: [{
        in: "path",
        name: "email",
        description: "Email of the user.",
        schema: {
            type: "string",
            format: "email"
        },
        required: true
    }],
    responses: {
        200: {
          description: "OK. Email was sent if the user exists!",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
            content:{
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            Error: {
                                type: "string",
                                description: "Includes a description of what is wrong with the request."
                            }
                        }
                    }
                }
            }
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}