import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidRestaurantStatusTransitionError extends DomainError {
    readonly code = 'INVALID_RESTAURANT_STATUS_TRANSITION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(from: string, to: string) {
        super(`Cannot transition restaurant status from ${from} to ${to}`);
    }
}
