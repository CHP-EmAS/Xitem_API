export const post_generate_invitation_token: Object =  {
    tags: ["Calendar"],
    summary: "Generates a calendar invitation token",
    description: "Generates an invitation token where rights can be passed directly when registering for a new calendar.",
    operationId: "generateInvitationToken",
    parameters: [{
        in: "path",
        name: "calendar_id",
        description: "The ID of the calendar entry.",
        schema: {
            type: "string"
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
        description: "Invitation Informations",
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        can_create_events: {
                            type: "boolean"
                        },
                        can_edit_events: {
                            type: "boolean"
                        },
                        expire: {
                            type: "number",
                            description: "Expiration time in minutes"
                        }
                    }
                },
            }
        }
    },
    responses: {
        200: {
          description: "OK. Invitation token created",
          content:{
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        Token: {
                            type: "string",
                            format: "jwt",
                            description: "Invitation token"
                        }
                    },
                }
            }
          },
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
        },
        403: {
            description: "Forbidden. Insufficient permissions."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}