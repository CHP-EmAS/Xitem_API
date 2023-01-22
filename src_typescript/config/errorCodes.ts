
//calendar errors
export const assocUserAlreadyExists = "already_exists";
export const calendarNotEmpty       = "not_empty";
export const lastMember             = "last_member";
export const lastOwner              = "last_owner";

//event errors
export const endBeforeStart = "end_before_start";
export const startAfter1900 = "start_after_1900";

//voting errors
export const alreadyVoted               = "already_voted";
export const noMultipleChoiceEnabled    = "no_multiple_choice_enabled";
export const invalidChoiceAmount        = "invalid_choice_amount";

//400 errors
export const emailExistsError   = "email_exists";
export const missingArgument    = "missing_argument";
export const shortName          = "short_name";
export const shortPassword      = "short_password";
export const repeatNotMatch     = "repeat_wrong";

//401 errors
export const wrongPassword = "wrong_password";

//403 errors
export const accessForbidden            = "access_forbidden";
export const insufficientPermissions    = "insufficient_permissions";
export const calendarNotJoinable        = "calendar_not_joinable";

//404 errors
export const eventNotFound      = "event_not_found";
export const userNotFound       = "user_not_found";
export const calendarNotFound   = "calendar_not_found";
export const memberNotFound     = "member_not_found";
export const roleNotFound       = "role_not_found";
export const votingNotFound     = "voting_not_found";
export const choiceNotFound     = "choice_not_found";
export const noteNotFound       = "note_not_found";

//auth errors
export const invalidToken           = "invalid_token";
export const tokenRequired          = "token_required";
export const expiredToken           = "expired_token";
export const bannedUser             = "banned";
export const passwordChanged        = "pass_changed";
export const authenticationFailed   = "auth_failed";
export const tokenStillValid        = "token_still_valid";

//invalid errors
export const invalidNumber      = "invalid_number";
export const invalidEmail       = "invalid_email";
export const invalidTitle       = "invalid_title";
export const invalidDate        = "invalid_date";
export const invalidColor       = "invalid_color";
export const invalidJson        = "invalid_json";
export const invalidFile        = "invalid_file";
export const payloadTooLarge    = "payload_too_large";