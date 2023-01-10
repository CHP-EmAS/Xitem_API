export const post_change_password: Object =  {
    tags: ["Authentication"],
    summary: "Change the Password of a User.",
    description: "In order to change the password of the user, the auth-token is required. The password of the user stored in the auth-token is changed.",
    operationId: "changePassword",
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
        description: "JSON Object containing the required data for changing the password",
        required: true,
        content: {
            "application/json": {
                schema: {
                    title: "Change Password Schema ",
                    type: "object",
                    properties: {
                        old_password: {
                            type: "string",
                            format: "password"
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
                    required: ["old_password", "new_password", "repeat_password"],
                }
            }
        }
    },
    responses: {
        200: {
          description: "OK. Password successfully changed!",
          content:{
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        Status: {
                            $ref: "#/components/schemas/Status",
                            description: "Http response status."
                        },
                        Info: {
                            type: "string",
                        }
                    },
                }
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
            description: "Unauthorized. Includes a description of what is wrong with the request."
        },
        404: {
            description: "Not Found. User not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}