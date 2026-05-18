import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantNotFoundError extends DomainError {
    readonly code = 'RESTAURANT_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Restaurant not found');
    }
}
