import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantNotAvailableForOrderError extends DomainError {
    readonly code = 'RESTAURANT_NOT_AVAILABLE_FOR_ORDER';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('This restaurant is not currently accepting orders');
    }
}
