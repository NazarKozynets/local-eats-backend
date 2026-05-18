import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantOwnerCannotBeRemovedError extends DomainError {
    readonly code = 'RESTAURANT_OWNER_CANNOT_BE_REMOVED';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('The only owner of a restaurant cannot be removed');
    }
}
