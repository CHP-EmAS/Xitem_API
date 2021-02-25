export const patch_user: Object = {
    tags: ["User"],
    summary: "Update an existing user",
    description: "Changes the user informations of the user stored in the auth-token.",
    operationId: "editUser",
    parameters: [{
            in: "path",
            name: "user_id",
            description: "The ID of the user entry.",
            schema: {
                type: "string",
                format: "uuid"
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
        description: "User informations to change",
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                        },
                        birthday: {
                            type: "string",
                            format: "date"
                        },
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
            description: "Forbidden. Authorization is not sufficient to change the user"
        },
        404: {
            description: "Not Found. User not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}