export const get_avatar: Object = {
    tags: ["User"],
    summary: "Get the profile picture of a user",
    operationId: "getAvatar",
    parameters: [{
            in: "path",
            name: "user_id",
            description: "The id of the user The ID of the user whose profile picture is requested.",
            schema: {
                type: "string",
                format: "uuid"
            },
            required: true
    }],
    responses: {
        200: {
            description: "OK. Response Body contains the profile picture",
        },
        400: {
            description: "Bad Request. Request doesnt match the requiered pattern!",
        },
        404: {
            description: "Not Found. User not found."
        },
        "5XX": {
            description: "Server Error. Upps, an unexpected error occurred.",
        }
    }
}