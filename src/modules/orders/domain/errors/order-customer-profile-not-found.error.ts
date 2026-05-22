import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderCustomerProfileNotFoundError extends DomainError {
    readonly code = 'ORDER_CUSTOMER_PROFILE_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Customer profile not found — please complete your profile before ordering');
    }
}
