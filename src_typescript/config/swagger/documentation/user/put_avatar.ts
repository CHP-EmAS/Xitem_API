export const put_avatar: Object = {
    tags: ["User"],
    summary: "Changes the profile picture of a user",
    description: "Changes the profile image of the user stored in the auth-token. Currently only PNG images are allowed.",
    operationId: "changeAvatar",
    parameters: [{
        in: "path",
        name: "user_id",
        description: "The ID of the user entry.",
        schema: {
            type: "string",
            format: "uuid"
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
        description: "Profile picture to upload",
        required: true,
        content: {
            "multipart/form-data": {
                schema: {
                    type: "object",
                    properties:{
                        avatar: {
                            type: "string",
                            format: "binary"
                        }
                    }
                },
            }
        }
    },
    responses: {
        200: {
          description: "OK. Successfully uploaded!",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        401: {
            description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'Token expired!'."
        },
        403: {
            description: "Forbidden. Authorization is not sufficient to change the users avatar"
        },
        404: {
            description: "Not Found. User not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}