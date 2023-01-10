export const delete_user_by_admin: Object = {
    tags: ["User"],
    summary: "Delete a specific user instance",
    description: "In order to delete a user instance, a auth-token is required. The authenticated user must be a system administrator.",
    operationId: "deleteUserByAdmin",
    parameters: [{
        in: "path",
        name: "user_id",
        description: "The ID of the user to be deleted.",
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
          description: "OK. The user instance was successfully deleted.",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        403: {
            description: "Forbidden. User is not an system administrator."
        },
        404: {
            description: "Not Found. User not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}