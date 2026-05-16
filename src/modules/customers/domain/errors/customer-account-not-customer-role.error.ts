import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerAccountNotCustomerRoleError extends DomainError {
    readonly code = 'CUSTOMER_ACCOUNT_NOT_CUSTOMER_ROLE';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor(details?: DomainErrorDetails) {
        super('Account does not have the CUSTOMER role', details);
    }
}
