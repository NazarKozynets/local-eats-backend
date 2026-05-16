import { HttpStatus } from '@nestjs/common';
import { DomainError, type DomainErrorDetails } from '../../../../shared/domain/errors/domain.error';

export class CustomerAddressNotFoundError extends DomainError {
    readonly code = 'CUSTOMER_ADDRESS_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor(details?: DomainErrorDetails) {
        super('Customer address not found', details);
    }
}
