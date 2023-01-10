import * as authentication from "./authentication"
import * as user from "./user"
import * as calendar from "./calendar"

const documentation_header: object = {
    openapi: "3.0.0",
    info: {
        title: process.env.APP_NAME + " API Documentation",
        version: "1.0.0",
        description: "This documentation describes the structure and use of the API. All paths are described in detail, which method and variables must be used, how the response is structured and which response codes exist."
    },
    host: "api.chp-games.de",
    basePath: "/"
}

const tags: object = {
    tags: [
    {
        name: "Authentication",
        description: "Authentication functions for verifying users and changing passwords",
    },
    {
        name: "User",
        description: "Functions for displaying, changing and deleting user data"
    },
    {
        name: "Calendar",
        description: "Function for displaying, changing and deleting calendar data."
    },
    {
        name: "Event",
        description: "Function for displaying, changing and deleting event data."
    },
    {
        name: "Voting",
        description: "Function for creating, deleting, vote a voting."
    },
    {
        name: "Note",
        description: "Function for displaying, creating, changing and deleting notes."
    },
    {
        name: "Filter",
        description: "Filter function for filtering Entrys."
    },
    {
        name: "Statistics",
        description: "Retrieve statistics",
    }
  ]
}

const schemes: object = {schemes: ["https"]};

//###################### Authentication ######################//
const login: object = {
    post: authentication.post_login
}
const changePassword: object = {
    post: authentication.post_change_password
}
const sendVerification: object = {
    post: authentication.post_send_verification
}
const verifyEmail: object = {
    post: authentication.post_verify
}
const sendResetPwToken: object = {
    post: authentication.post_send_password_recovery
}
const resetPassword: object = {
    post: authentication.post_reset_password
}
const refreshAuthToken: object = {
    get: authentication.get_refresh_auth_token
}
const requestSecurityToken: object = {
    get: authentication.get_security_token
}
const requestUserIDFromToken: object = {
    get: authentication.get_user_id_from_token
}

//###################### User ######################//
const userEntry: object = {
    get: user.get_user,
    patch: user.patch_user,
    delete: user.delete_user_by_admin
}
const userCalendarEntry: object = {
    get: user.get_calendars
}
const avatarEntry: object = {
    get: user.get_avatar,
    put: user.put_avatar
}
const sendUserInformationMail: object = {
    post: user.post_send_infomail
}
const sendUserDeletionMail: object = {
    post: user.post_deletion_request
}
const deleteUser: object = {
    delete: user.delete_user
}

//###################### Calendar ######################//
const calendarEntry: object = {
    get: calendar.get_calendar,
    patch: calendar.patch_calendar,
    delete: calendar.delete_calendar
}
const patchCalendarLayout: object = {
    patch: calendar.patch_calendar_layout
}
const createCalendar: object = {
    post: calendar.post_create_calendar
}
const generateInvitationToken: object = {
    post: calendar.post_generate_invitation_token
}
const allAssociatedUsers: object = {
    get: {
        tags: ["Calendar"],
        summary: "Get all associated users from a calendar entry.",
        description: "To query the associated users of a calendar, the requesting user must be a member of the calendar.",
        operationId: "getAssocUsers",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the Calendar entry.",
            schema: {
                type: "string"
            },
            required: true
        },
        {
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. Response Body contains an array of associated users",
              content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            associated_users: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        user_id: {type:"string",format:"uuid"},
                                        is_owner: {type:"boolean"},
                                        can_create_events: {type:"boolean"},
                                        can_delete_events:{type:"boolean"}
                                    },
                                },
                                example: [
                                    {
                                        user_id: "ff9761fa-049d-4976-8837-9dddbf3a64f9",
                                        is_owner: true,
                                        can_create_events: true,
                                        can_delete_events: true
                                    },
                                    {
                                        user_id: "822cf097-a12e-4de5-8abe-449057a804ca",
                                        is_owner: false,
                                        can_create_events: true,
                                        can_delete_events: true
                                    }
                                ]
                            }
                        }
                    }
                }
              },
              headers: {
                "user-token": {
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
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
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
            },
            403: {
                description: "Forbidden. Authorization is not sufficient."
            },
            404: {
                description: "Not Found. User not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    },
    post: {
        tags: ["Calendar"],
        summary: "Add an associated user",
        description: "To add a user to a calendar, the requesting user must be the owner of the calendar.",
        operationId: "addAssocUser",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar_id entry.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        requestBody: {
            description: "JSON Object containing the required calendar data",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            password: {
                                type: "string",
                            },
                        },
                        example: {
                            password: "SECRET",
                        }
                    }
                }
            }
        },
        responses: {
            201: {
              description: "Created. Successfully added!",
              content:{
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            Info: {
                                type: "string",
                            }
                        },
                        example: {
                            Status: {
                                Code: "200",
                                Message: "OK"
                            },
                            Info: "Associated user was successfully created"
                        }
                    }
                }
              },
              headers: {
                "user-token": {
                    schema: {
                        type: "string",
                        format: "jwt"
                    },
                    description: "JWT to authenticate requests with the registered user. Has a validity period of one hour."
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
                                Error: {
                                    type: "string",
                                    description: "Includes a description of what is wrong with the request."
                                }
                            }
                        }
                    }
                }
            },
            401: {
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'.",
            },
            403: {
                description: "Forbidden. Authorization is not sufficient to add a user to the calendar"
            },
            404: {
                description: "Not Found. User not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    },
}
const associatedUserEntry: object = {
    get: {
        tags: ["Calendar"],
        summary: "Get an specific associated user from a calendar entry.",
        description: "To query the associated user of a calendar, the requesting user must be a member of the calendar.",
        operationId: "getAssocUserInstance",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the Calendar entry.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "path",
            name: "user_id",
            description: "The ID of the User entry.",
            schema: {
                type: "string",
                format: "uuid"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. Response Body contains informations of associated user",
              content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            associated_users: {
                                type: "object",
                                properties: {
                                    user_id: {type:"string",format:"uuid"},
                                    is_owner: {type:"boolean"},
                                    can_create_events: {type:"boolean"},
                                    can_delete_events:{type:"boolean"}
                                },
                                example:
                                {
                                    user_id: "ff9761fa-049d-4976-8837-9dddbf3a64f9",
                                    is_owner: true,
                                    can_create_events: true,
                                    can_delete_events: true
                                }
                            }
                        }
                    }
                }
              },
              headers: {
                "user-token": {
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
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
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
            },
            403: {
                description: "Forbidden. Authorization is not sufficient."
            },
            404: {
                description: "Not Found. User not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    },
    patch: {
        tags: ["Calendar"],
        summary: "Update an associated user",
        description: "To update a user to a calendar, the requesting user must be the owner of the calendar.",
        operationId: "patchAssocUser",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar_id entry.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "path",
            name: "user_id",
            description: "The ID of the user to be added or changed to the calendar.",
            schema: {
                type: "string",
                format: "uuid"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        requestBody: {
            description: "JSON Object containing the required calendar data",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            is_owner: {
                                type: "boolean",
                                default: false
                            },
                            can_create_events: {
                                type: "boolean",
                                default: false
                            },
                            can_delete_events: {
                                type: "boolean",
                                default: false
                            }
                        },
                        example: {
                            is_owner: false,
                            can_create_events: true,
                            can_delete_events: true
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: "OK. Successfully updated!",
                content:{
                  "application/json": {
                      schema: {
                          type: "object",
                          properties: {
                              Status: {
                                  $ref: "#/components/schemas/Status",
                                  description: "Http response status."
                              },
                              Info: {
                                  type: "string",
                              },
                              Changes: {
                                  type: "number",
                              }
                          },
                          example: {
                              Status: {
                                  Code: "200",
                                  Message: "OK"
                              },
                              Info: "Associated user was successfully edited",
                              Changes: 2
                          }
                      }
                  }
                },
                headers: {
                  "user-token": {
                      schema: {
                          type: "string",
                          format: "jwt"
                      },
                      description: "Newly generated JWT."
                  }
                }
            },
            201: {
              description: "Created. Successfully added!",
              content:{
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            calendar_id: {
                                type: "number",
                                format: "integer",
                                description: "ID of the new calendar."
                            }
                        },
                        example: {
                            Status: {
                                Code: "200",
                                Message: "OK"
                            },
                            Info: "User was successfully added to the calendar"
                        }
                    }
                }
              },
              headers: {
                "user-token": {
                    schema: {
                        type: "string",
                        format: "jwt"
                    },
                    description: "JWT to authenticate requests with the registered user. Has a validity period of one hour."
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
                                Error: {
                                    type: "string",
                                    description: "Includes a description of what is wrong with the request."
                                }
                            }
                        }
                    }
                }
            },
            401: {
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'.",
            },
            403: {
                description: "Forbidden. Authorization is not sufficient to add a user to the calendar"
            },
            404: {
                description: "Not Found. User not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    },
    delete: {
        tags: ["Calendar"],
        summary: "Delete a specific associated user instance from a calendar",
        description: "In order to delete a associated user instance, a user-token is required. The authenticated user must be the owner of the calendar.",
        operationId: "deleteAssocUser",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar where the user should be removed from.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "path",
            name: "user_id",
            description: "The ID of the user to be removed from the calendar.",
            schema: {
                type: "string",
                format: "uuid"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. The associated user instance was successfully removed from the calendar.",
              content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            }
                        }
                    },
                }
              },
              headers: {
                "user-token": {
                    schema: {
                        type: "string",
                        format: "jwt"
                    },
                    description: "Newly generated JWT."
                }
              }
            },
            401: {
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
            },
            403: {
                description: "Forbidden. User is not the owner of the calendar."
            },
            404: {
                description: "Not Found. Associated user not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    }
}

//###################### Events ######################//
const eventEntry: object = {
    get: {
        tags: ["Event"],
        summary: "Get event data.",
        description: "In order to get event informations, the user-token is required. The authenticated user must be the member of the calendar.",
        operationId: "getEvent",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar where the event is in.",
            schema: {
                type: "string",
            },
            required: true
        },{
            in: "path",
            name: "event_id",
            description: "The ID of the event entry.",
            schema: {
                type: "number",
                format: "integer"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. Response Body contains the event informations",
              content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            Event: {
                                type: "object",
                                properties: {
                                    event_id: {type:"number",format:"integer"},
                                    title: {type:"string"},
                                    description: {type:"string"},
                                    begin_date: {type:"string", format: "date"},
                                    end_date: {type:"string", format: "date"},
                                    creation_date: {type:"string", format: "date"},
                                    color: {type:"number",format:"integer"},
                                    associated_calendar: {type:"number",format:"integer"},
                                    created_by_user: {type:"string", format: "uuid"}
                                },
                                description: "Event Information"
                            }
                        }
                    },
                }
              },
              headers: {
                "user-token": {
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
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
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
            },
            403: {
                description: "Forbidden. Authorization is not sufficient."
            },
            404: {
                description: "Not Found. User not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    },
    patch: {
        tags: ["Event"],
        summary: "Update an existing event",
        description: "Changes the event informations of the given calendar_id and event_id. The authenticated user must be member of the calendar. If the user is not the creator of the event, the user must also have edit permission in the calendar in order to edit it",
        operationId: "editEvent",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar where the event is in.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "path",
            name: "event_id",
            description: "The ID of the event entry.",
            schema: {
                type: "number",
                format: "integer"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        requestBody: {
            description: "Event informations to change",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            begin_date: {
                                type: "string",
                                format: "date"
                            },
                            end_date: {
                                type: "string",
                                format: "date"
                            },
                            title: {
                                type: "string",
                            },
                            description: {
                                type: "string",
                            },
                            color: {
                                type: "number",
                                format: "integer"
                            }
                        }
                    },
                    examples: {
                        "Change title": {
                            summary: "An example for changing the title.",
                            value: {
                                title: "Birthday Clemens"
                            }
                        },
                        "Change several entries":{
                            summary: "An example for changing several entries.",
                            value: {
                                title: "Birthday Clemens",
                                description: "Buy a present!"
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
              description: "OK. Successfully updated!",
              content:{
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            Info: {
                                type: "string",
                            },
                            Changes: {
                                type: "number",
                            }
                        },
                        example: {
                            Status: {
                                Code: "200",
                                Message: "OK"
                            },
                            Info: "Event succesfully updated",
                            Changes: 2
                        }
                    }
                }
              },
              headers: {
                "user-token": {
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
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
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
            },
            403: {
                description: "Forbidden. Authorization is not sufficient to change the evnet"
            },
            404: {
                description: "Not Found. Calendar not found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    },
    delete: {
        tags: ["Event"],
        summary: "Delete a specific event instance",
        description: "In order to delete a event instance, a user-token is required. The authenticated user must be member of the calendar. If the user is not the creator of the event, the user must also have edit permission in the calendar in order to delete it",
        operationId: "deleteEvent",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar where the event is in.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "path",
            name: "event_id",
            description: "The ID of the event entry.",
            schema: {
                type: "number",
                format: "integer"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. The event instance was successfully deleted.",
              content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            }
                        }
                    },
                }
              },
              headers: {
                "user-token": {
                    schema: {
                        type: "string",
                        format: "jwt"
                    },
                    description: "Newly generated JWT."
                }
              }
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
}
const createEvent: object = {
    post: {
        tags: ["Event"],
        summary: "Create a new event in a specific calendar",
        description: "In order to creaete an event, the user-token is required and the user must be verified. The authenticated user must be a member of the calendar and must have permissions to create.",
        operationId: "createEvent",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar where the event shoud be created in.",
            schema: {
                type: "string"
            },
            required: true
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        requestBody: {
            description: "JSON Object containing the required event data",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            begin_date: {
                                type: "string",
                                format: "date"
                            },
                            end_date: {
                                type: "string",
                                format: "date"
                            },
                            title: {
                                type: "string",
                            },
                            description: {
                                type: "string",
                            },
                            color: {
                                type: "number",
                                format: "integer"
                            }
                        },
                        required: ["begin_date", "end_date","title"],
                        example: {
                            begin_date: "2017-07-21",
                            end_date: "2017-07-22",
                            title: "Geburtstag von Ron",
                            description: "Geschenk besorgen!",
                            color: 8257330
                        }
                    }
                }
            }
        },
        responses: {
            201: {
              description: "OK. Successfully created!",
              content:{
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            event_id: {
                                type: "number",
                                format: "integer",
                                description: "ID of the new event."
                            }
                        },
                        example: {
                            Status: {
                                Code: "200",
                                Message: "OK"
                            },
                            event_id: 42
                        }
                    }
                }
              },
              headers: {
                "user-token": {
                    schema: {
                        type: "string",
                        format: "jwt"
                    },
                    description: "JWT to authenticate requests with the registered user. Has a validity period of one hour."
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
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
                                Error: {
                                    type: "string",
                                    description: "Includes a description of what is wrong with the request."
                                }
                            }
                        }
                    }
                }
            },
            401: {
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'.",
            },
            403: {
                description: "Forbidden. Authorization is not sufficient."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    }
}

//###################### Filter ######################//
const searchUser: object = {
    get: {
        tags: ["Filter"],
        summary: "Search users by their nickname",
        description: "When searching with a certain search string, a list of users who have the search string in their nickname is returned. The size of the list is determined by limit (max 50).",
        operationId: "searchUser",
        parameters: [{
            name: "search",
            in:	"query",
            description: "search string",
            required:	true,
            type:	"string",
        },
        {
            name: "limit",
            in:	"query",
            description: "Maximum size of the returned list (max 50).",
            required:	true,
            type:	"integer",
        }],
        responses: {
            200: {
              description: "OK. Response Body contains a list of users.",
            },
            400: {
                description: "Bad Request. Request doesnt match the requiered pattern!",
                content:{
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
                                Error: {
                                    type: "string",
                                    description: "Includes a description of what is wrong with the request."
                                }
                            },
                        }
                    }
                }
            },
            404: {
                description: "Not Found. No users found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    }
}
const searchEvents: object = {
    get: {
        tags: ["Filter"],
        summary: "Search events in a given period",
        description: "When searching with a certain period, a list of events which lies in this period are returned. The authenticated user must be member of the calendar.",
        operationId: "searchEvent",
        parameters: [{
            in: "path",
            name: "calendar_id",
            description: "The ID of the calendar where the events are in.",
            schema: {
                type: "string"
            },
            required: true
        },{
            name: "begin_date",
            in:	"query",
            description: "start date of the period",
            required:	true,
            type:	"string",
            format: "date"
        },{
            name: "end_date",
            in:	"query",
            description: "end date of the period",
            required:	true,
            type:	"string",
            format: "date"
        },{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. Response Body contains a list of events.",
            },
            400: {
                description: "Bad Request. Request doesnt match the requiered pattern!",
                content:{
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                Status: {
                                    $ref: "#/components/schemas/Status",
                                    description: "Http response status."
                                },
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
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'token expired'."
            },
            403: {
                description: "Forbidden. User is not the owner of the calendar."
            },
            404: {
                description: "Not Found. No events found."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    }
}

//###################### Statistics ######################//

const getUserStatistics: object = {
    get: {
        tags: ["Statistics"],
        summary: "Get statistics of users in " + process.env.APP_NAME + ".",
        description: "In order to get the statistics informations, the user-token is required. The authenticated user must be an Administrator.",
        operationId: "getUserStatistics",
        parameters: [{
            in: "header",
            name: "user-token",
            schema: {
                type: "string",
                format: "jwt"
            },
            required: true
        }],
        responses: {
            200: {
              description: "OK. Response Body contains the statistics informations",
              content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            Status: {
                                $ref: "#/components/schemas/Status",
                                description: "Http response status."
                            },
                            User_Statistic: {
                                type: "object",
                                properties: {
                                    Registered: {
                                        type: "integer",
                                        example: 5
                                    },
                                    Roles: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                Role: {
                                                    type: "string"
                                                },
                                                Amount: {
                                                    type: "integer"
                                                }
                                            }
                                        },
                                        example: [
                                            {
                                                Role: "Verifizierter Nutzer",
                                                Amount: 3
                                            },
                                            {
                                                Role: "Administrator",
                                                Amount: 2
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
              },
              headers: {
                "user-token": {
                    schema: {
                        type: "string",
                        format: "jwt"
                    },
                    description: "Newly generated JWT."
                }
              }
            },
            401: {
                description: "Unauthorized. JWT not valid! When the JWT has expired, the response body contains the error: 'Token expired!'."
            },
            403: {
                description: "Forbidden. User is not an Administrator or higher."
            },
            "5XX": {
                description: "Server Error. Upps, an unexpected error occurred.",
            }
        }
    }
}

const StatusResponsSchema: object = {
    type: "object",
    properties: {
        Code: {
            type: "integer",
            format: "int64",
            description: "Http status code."
        },
        Message: {
            type: "string",
            description: "Standart description of the http status code."
        }
    }
}

const components: object = {
    components: {
        schemas: {
            Status: StatusResponsSchema
        }
    }
}

const paths: object = {
    paths: {
        "/auth/login": login,
        "/auth/change-password": changePassword,
        "/auth/send-verification": sendVerification,
        "/auth/verify": verifyEmail,
        "/auth/reset_password/{email}": sendResetPwToken,
        "/auth/reset_password": resetPassword,
        "/auth/refresh": refreshAuthToken,
        "/auth/security": requestSecurityToken,
        "/auth/id": requestUserIDFromToken,

        "/user/{user_id}": userEntry,
        "/user/{user_id}/calendars": userCalendarEntry,
        "/user/{user_id}/avatar": avatarEntry,
        "/user/{user_id}/infomail": sendUserInformationMail,
        "/user/{user_id}/deletion_request": sendUserDeletionMail,
        "/user": deleteUser,

        "/calendar": createCalendar,
        "/calendar/{calendar_id}": calendarEntry,
        "/calendar/{calendar_id}/layout": patchCalendarLayout,
        "/calendar/{calendar_id}/invitation": generateInvitationToken,
        "/calendar/{calendar_id}/user": allAssociatedUsers,
        "/calendar/{calendar_id}/user/{user_id}": associatedUserEntry,

        "/calendar/{calendar_id}/event": createEvent,
        "/calendar/{calendar_id}/event/{event_id}": eventEntry,

        "/filter/user": searchUser,
        "/filter/calendar/{calendar_id}/period": searchEvents,

        "/statistic/users": getUserStatistics

    }
}

export default Object.assign(documentation_header,tags,schemes,paths,components);
