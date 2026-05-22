import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCourierAvailabilityTransitionError extends DomainError {
    readonly code = 'INVALID_COURIER_AVAILABILITY_TRANSITION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(reason: string) {
        super(`Cannot change courier availability: ${reason}`);
    }
}
