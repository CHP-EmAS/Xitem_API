export const delete_calendar: Object = {
    tags: ["Calendar"],
    summary: "Delete a specific calendar instance",
    description: "In order to delete a calendar instance, a auth-token is required. The authenticated user must be the owner of the calendar.",
    operationId: "deleteCalendar",
    parameters: [{
        in: "path",
        name: "calendar_id",
        description: "The ID of the calendar to be deleted.",
        schema: {
            type: "string"
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
          description: "OK. The calendar instance was successfully deleted.",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        403: {
            description: "Forbidden. User is not the owner of the calendar."
        },
        404: {
            description: "Not Found. Calendar not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}