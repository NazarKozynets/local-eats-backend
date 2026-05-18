import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidRestaurantWorkingHoursError extends DomainError {
    readonly code = 'INVALID_RESTAURANT_WORKING_HOURS';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}
