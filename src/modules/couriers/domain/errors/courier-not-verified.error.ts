import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierNotVerifiedError extends DomainError {
    readonly code = 'COURIER_NOT_VERIFIED';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Courier must be verified to perform this action');
    }
}
