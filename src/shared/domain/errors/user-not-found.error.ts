import {DomainError, type DomainErrorDetails} from "./domain.error";

export class UserNotFoundError extends DomainError {
    readonly code = "USER_NOT_FOUND";

    constructor(details?: DomainErrorDetails) {
        super("User not found", details);
    }
}
