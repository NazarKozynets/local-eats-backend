import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderRestaurantAccessDeniedError extends DomainError {
    readonly code = 'ORDER_RESTAURANT_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You are not allowed to manage orders for this restaurant');
    }
}
