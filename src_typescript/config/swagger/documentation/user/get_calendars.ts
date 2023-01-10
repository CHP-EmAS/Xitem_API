export const get_calendars: Object = {
    tags: ["User"],
    summary: "Returns all calendars in which the user is a member.",
    description: "In order to get the informations, the auth-token is required.",
    operationId: "getUserCalendars",
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
          description: "OK. Contains a list of calendars which have the user as a member with corresponding rights",
          content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        associated_calendars: {
                            type: "array",
                            items: {
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
                            }
                        }
                    }
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
            description: "Not Found. No calendars found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}