import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCourierVerificationTransitionError extends DomainError {
    readonly code = 'INVALID_COURIER_VERIFICATION_TRANSITION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(from: string, to: string) {
        super(`Cannot transition courier verification status from ${from} to ${to}`);
    }
}
