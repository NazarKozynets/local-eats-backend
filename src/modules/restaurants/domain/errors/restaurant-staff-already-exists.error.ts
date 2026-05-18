import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantStaffAlreadyExistsError extends DomainError {
    readonly code = 'RESTAURANT_STAFF_ALREADY_EXISTS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('User is already a staff member of this restaurant');
    }
}
