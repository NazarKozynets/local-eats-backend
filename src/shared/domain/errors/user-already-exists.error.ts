import {DomainError, type DomainErrorDetails} from "./domain.error";

export class UserAlreadyExistsError extends DomainError {
    readonly code = "USER_ALREADY_EXISTS";

    constructor(details?: DomainErrorDetails) {
        super("User already exists", details);
    }
}
