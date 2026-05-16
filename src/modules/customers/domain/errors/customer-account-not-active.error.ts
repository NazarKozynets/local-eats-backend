import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerAccountNotActiveError extends DomainError {
    readonly code = 'CUSTOMER_ACCOUNT_NOT_ACTIVE';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor(details?: DomainErrorDetails) {
        super('Account is not active', details);
    }
}
