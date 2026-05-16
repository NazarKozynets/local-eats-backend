import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerProfileNotFoundError extends DomainError {
    readonly code = 'CUSTOMER_PROFILE_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor(details?: DomainErrorDetails) {
        super('Customer profile not found', details);
    }
}
