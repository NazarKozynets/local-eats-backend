import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantAccountNotManagerRoleError extends DomainError {
    readonly code = 'RESTAURANT_ACCOUNT_NOT_MANAGER_ROLE';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Account does not have RESTAURANT_MANAGER role');
    }
}
