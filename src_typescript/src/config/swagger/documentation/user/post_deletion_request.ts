export const post_deletion_request: Object = {
    tags: ["User"],
    summary: "Request for deletion of the user account",
    description: "Sends a delete key to the email of the specified user in the auth-token. To send the request the security token is needed.",
    operationId: "sendUserDeletionMail",
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
    },
    {
        in: "header",
        name: "security-token",
        schema: {
            type: "string",
            format: "jwt"
        },
        required: true
    }],
    responses: {
        200: {
          description: "OK. Email with the delete key was sent successfully.",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        403: {
            description: "Forbidden. Not the necessary permissions"
        },
        404: {
            description: "Not Found. No user found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}