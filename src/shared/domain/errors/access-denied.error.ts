import {DomainError, type DomainErrorDetails} from "./domain.error";

export class AccessDeniedError extends DomainError {
    readonly code = "ACCESS_DENIED";

    constructor(details?: DomainErrorDetails) {
        super("Access denied", details);
    }
}
