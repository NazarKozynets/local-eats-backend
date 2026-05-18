import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantAccountNotActiveError extends DomainError {
    readonly code = 'RESTAURANT_ACCOUNT_NOT_ACTIVE';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Account is not active');
    }
}
