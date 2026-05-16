import {DomainError, type DomainErrorDetails} from "./domain.error";

export class InvalidCredentialsError extends DomainError {
    readonly code = "INVALID_CREDENTIALS";

    constructor(details?: DomainErrorDetails) {
        super("Invalid credentials", details);
    }
}
