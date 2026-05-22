import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierProfileAlreadyExistsError extends DomainError {
    readonly code = 'COURIER_PROFILE_ALREADY_EXISTS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Courier profile already exists for this user');
    }
}
