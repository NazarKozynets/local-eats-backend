import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantAccessDeniedError extends DomainError {
    readonly code = 'RESTAURANT_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You do not have permission to perform this action on the restaurant');
    }
}
