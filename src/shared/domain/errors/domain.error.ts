export type DomainErrorDetails = Record<string, unknown>;

export abstract class DomainError extends Error {
    abstract readonly code: string;
    readonly httpStatus?: number;

    readonly details?: DomainErrorDetails;

    protected constructor(message: string, details?: DomainErrorDetails) {
        super(message);
        this.name = new.target.name;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, new.target);
    }
}
