import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantAccountNotFoundError extends DomainError {
    readonly code = 'RESTAURANT_ACCOUNT_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Account not found');
    }
}
