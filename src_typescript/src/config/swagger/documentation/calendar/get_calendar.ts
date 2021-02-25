export const get_calendar: Object = {
    tags: ["Calendar"],
    summary: "Get calendar data.",
    description: "In order to get calendar informations, the auth-token is required. If the given calendar_id is correct,all calender data will be send as a respond.",
    operationId: "getCalendar",
    parameters: [{
        in: "path",
        name: "calendar_id",
        description: "The ID of the calendar entry.",
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
          description: "OK. Response Body contains the calendar informations",
          content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        is_owner: {type:"boolean"},
                        can_create_events: {type:"boolean"},
                        can_edit_events: {type:"boolean"},
                        color: {type:"number",format:"integer"},
                        icon: {type:"number",format:"integer"},
                        calendarObject: {
                            type: "object",
                            properties: {
                                name: {type:"string"},
                                id: {type:"number",format:"integer"},
                                can_join: {type:"boolean"},
                                creation_date: {type:"string", format: "date"}
                            }
                        }
                    },
                    description: "Calendar Information/Rights"
                },
            }
          },
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        404: {
            description: "Not Found. Calendar not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}