import {HttpStatus, Injectable} from "@nestjs/common";
import {AccessDeniedError} from "../../../domain/errors/access-denied.error";
import {DomainError} from "../../../domain/errors/domain.error";
import {InvalidCredentialsError} from "../../../domain/errors/invalid-credentials.error";
import {UserAlreadyExistsError} from "../../../domain/errors/user-already-exists.error";
import {UserNotFoundError} from "../../../domain/errors/user-not-found.error";

type DomainErrorConstructor = new (...args: never[]) => DomainError;

export interface DomainExceptionMapping {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
}

const DOMAIN_ERROR_STATUS_MAP = new Map<DomainErrorConstructor, number>([
    [UserAlreadyExistsError, HttpStatus.CONFLICT],
    [UserNotFoundError, HttpStatus.NOT_FOUND],
    [InvalidCredentialsError, HttpStatus.UNAUTHORIZED],
    [AccessDeniedError, HttpStatus.FORBIDDEN],
]);

@Injectable()
export class DomainExceptionMapper {
    map(error: DomainError): DomainExceptionMapping {
        const statusCode =
            DOMAIN_ERROR_STATUS_MAP.get(error.constructor as DomainErrorConstructor) ??
            error.httpStatus ??
            HttpStatus.BAD_REQUEST;

        return {
            statusCode,
            code: error.code,
            message: error.message,
            details: error.details,
        };
    }
}