import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerAccountNotFoundError extends DomainError {
    readonly code = 'CUSTOMER_ACCOUNT_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor(details?: DomainErrorDetails) {
        super('Account not found', details);
    }
}
