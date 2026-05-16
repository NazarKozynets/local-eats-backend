import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerAddressDoesNotBelongToCustomerError extends DomainError {
    readonly code = 'CUSTOMER_ADDRESS_DOES_NOT_BELONG_TO_CUSTOMER';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor(details?: DomainErrorDetails) {
        super('Address does not belong to this customer', details);
    }
}
