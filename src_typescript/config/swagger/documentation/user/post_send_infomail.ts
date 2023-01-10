export const post_send_infomail: Object = {
    tags: ["User"],
    summary: "Request all user information per Email",
    description: "Send an email with all user information to the email specified in the user's account.",
    operationId: "sendUserInformationMail",
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
          description: "OK. Email with user information was sent successfully.",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
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