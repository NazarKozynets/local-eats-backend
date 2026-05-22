import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierProfileNotFoundError extends DomainError {
    readonly code = 'COURIER_PROFILE_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Courier profile not found');
    }
}
