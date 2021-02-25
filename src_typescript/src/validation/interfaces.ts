import { UserRoleModel } from "../models/UserRole";
import { CalendarModel } from "../models/Calendar";
import { StateCode } from "../controllers/holidayController";

//------- User Interfaces -------//
export interface EditUserInterface {
    name?: string;
    birthday?: Date;
}

//------- Filter Interfaces -------//
export interface FilterUserInterface {
    search: string;
    limit: number;
}

//------- Auth Interfaces -------//
export interface RegistrationInterface {
    email: string;
    name: string;
    birthday?: Date;
};

export interface LoginInterface {
    email: string;
    password: string;
};

export interface ValidationEmailInterface {
    validation_key: string;
    password: string;
    repeat_password: string;
};

export interface ChangePasswordInterface {
    old_password: string;
    new_password: string;
    repeat_password: string;
};

export interface ResetPasswordInterface {
    recovery_key: string;
    new_password: string;
    repeat_password: string;
};

export interface AccountDeletionInterface {
    deletion_key: string;
    password: string;
};

//------- JWT Interfaces -------//
export interface JWTPayloadInterface {
    user_id: string;
    iat?: number;
    exp?: number;
};

export interface LocalPayloadInterface {
    user_id: string;
    name: string;
    role: UserRoleModel;
};

export interface JWTEmailVerificationInterface {
    email: string;
    name: string;
    birthday?: Date;
    iat?: number;
    exp?:number;
}

export interface JWTPasswordRecoveryInterface {
    user_id: string;
    iat?: number;
    exp?:number;
}

export interface JWTAccountDeletionInterface {
    user_id: string;
    iat?: number;
    exp?:number;
}

export interface JWTCalendarInvitationInterface {
    calendar_id: string;
    can_create_events: boolean;
    can_edit_events: boolean;
    iat?: number;
    exp?:number;
}

//------- Calendar Interfaces -------//
export interface CreateCalendarInterface {
    title: string;
    password: string;
    can_join: boolean;
    color?: number;
    icon?: number;
};

export interface EditCalendarInterface {
    title?: string;
    can_join?: boolean;
    password?: string;
}

export interface AssociatedCalendarInterface {
    calendarObject: CalendarModel;
    is_owner: boolean;
    can_create_events: boolean;
    can_edit_events: boolean;
    color: number;
    icon: number;
};

export interface AssociatedUserInterface {
    user_id: string;
    is_owner: boolean;
    can_create_events: boolean;
    can_edit_events: boolean;
};

export interface PatchAssociatedUserInterface {
    is_owner?: boolean;
    can_create_events?: boolean;
    can_edit_events?: boolean;
}

export interface PatchCalendarLayoutInterface {
    color: number;
    icon: number;
}

export interface AddAssociatedUserInterface {
    password: string;
    color?: number;
    icon?: number;
}

export interface AddAssociatedUserInterface {
    password: string;
    color?: number;
    icon?: number;
}

export interface GenerateInvitationTokenInterface {
    can_create_events: boolean;
    can_edit_events: boolean;
    expire: number;
}

export interface VerifyInvitationInterface {
    invitation_token: string;
    color?: number;
    icon?: number;
}

//------- Event Interfaces -------//
export interface GetEventPeriodInterface {
    begin_date: Date;
    end_date: Date;
};

export interface CreateEventInterface {
    begin_date: Date;
    end_date: Date;
    title: string;
    daylong: boolean;
    description?: string;
    color?: number;
    pinned_note?: number;
};

export interface EditEventInterface {
    begin_date?: Date;
    end_date?: Date;
    title?: string;
    description?: string;
    daylong?: boolean;
    color?: number;
    pinned_note?: number;
};

//------- Voting Interfaces -------//
export interface VotingInterface {
    voting_id: number,
    owner_id: string,
    title: string;
    abstention_allowed: Boolean;
    multiple_choice: Boolean;
    userHasVoted: Boolean;
    userVotedFor: Array<number>;
    numberUsersWhoHaveVoted: number;
    choices: Array<VotingChoiceInterface>
    creation_date: Date;
};

export interface VotingChoiceInterface {
    choice_id: number,
    date: ( Date | null ),
    comment: ( string | null ),
    amountVotes: number,
};

export interface CreateVotingInterface {
    title: string;
    multiple_choice: Boolean;
    abstention_allowed: Boolean;
    choices: Array<AddVotingChoiceInterface>
};

export interface AddVotingChoiceInterface {
    date: Date;
    comment: string;
};

export interface VoteInterface {
    choice_ids: Array<number>;
};

//------- Note Interfaces -------//
export interface CreateNoteInterface {
    title: string;
    content: string;
    color: number;
    pinned: boolean;
}

export interface EditNoteInterface {
    title?: string;
    content?: string;
    color?: number;
    pinned?: boolean;
}

//------- Holiday Interfaces -------//

export interface PublicHoliday {
    name: string;
    date: Date;
}