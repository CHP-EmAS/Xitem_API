export const get_refresh_auth_token: Object =  {
    tags: ["Authentication"],
    summary: "Refresh the authentication token.",
    description: "In order to refresh the auth-token, the auth-token and refresh-token are required. The auth-token must be expired.",
    operationId: "refreshAuthToken",
    parameters: [{
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
        name: "refresh-token",
        schema: {
            type: "string",
            format: "jwt"
        },
        required: true
    }],
    responses: {
        200: {
          description: "OK. Auth-Token refreshed!",
          headers: {
            "auth-token": {
                schema: {
                    type: "string",
                    format: "jwt"
                },
                description: "Newly generated JWT."
            }
          }
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
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred."
        }
    }
}