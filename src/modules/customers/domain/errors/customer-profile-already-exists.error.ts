import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerProfileAlreadyExistsError extends DomainError {
    readonly code = 'CUSTOMER_PROFILE_ALREADY_EXISTS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(details?: DomainErrorDetails) {
        super('Customer profile already exists for this user', details);
    }
}
