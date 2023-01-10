export const get_user_id_from_token: Object =  {
    tags: ["Authentication"],
    summary: "Request user id from auth-token.",
    operationId: "requestUserIdFromToken",
    parameters: [{
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
            description: "OK",
            headers: {
              "security-token": {
                  schema: {
                      type: "string",
                      format: "jwt"
                  },
                  description: "Newly generated Security JWT."
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