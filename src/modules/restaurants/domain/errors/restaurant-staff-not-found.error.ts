import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantStaffNotFoundError extends DomainError {
    readonly code = 'RESTAURANT_STAFF_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Restaurant staff member not found');
    }
}
