export const get_security_token: Object =  {
    tags: ["Authentication"],
    summary: "Request security token.",
    description: "Request security-token for high security routes.",
    operationId: "securityToken",
    parameters: [{
        in: "header",
        name: "auth-token",
        schema: {
            type: "string",
            format: "jwt"
        },
        required: true
    },{
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