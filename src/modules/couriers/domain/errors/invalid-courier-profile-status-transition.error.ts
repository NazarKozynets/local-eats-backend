import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCourierProfileStatusTransitionError extends DomainError {
    readonly code = 'INVALID_COURIER_PROFILE_STATUS_TRANSITION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(from: string, to: string) {
        super(`Cannot transition courier profile status from ${from} to ${to}`);
    }
}
