import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderDeliveryAddressAccessDeniedError extends DomainError {
    readonly code = 'ORDER_DELIVERY_ADDRESS_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('This delivery address does not belong to your profile');
    }
}
