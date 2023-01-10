export const delete_user: Object = {
    tags: ["User"],
    summary: "Delete a user instance completly.",
    description: "Complete deletion of a user account with all user data. To delete the user, the deletion_key must be specified.",
    operationId: "deleteUserWithKey",
    requestBody: {
        description: "JSON Object containing the required data for deletion",
        required: true,
        content: {
            "application/json": {
                schema: {
                    title: "Deletion Schema ",
                    type: "object",
                    properties: {
                        deletion_key: {
                            type: "string",
                            format: "jwt"
                        },
                        password: {
                            type: "string",
                            format: "password"
                        },

                    },
                    required: ["deletion_key", "password"],
                }
            }
        }
    },
    responses: {
        200: {
          description: "OK. User successfully deleted!",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}