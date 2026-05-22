import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderDeliveryAddressNotFoundError extends DomainError {
    readonly code = 'ORDER_DELIVERY_ADDRESS_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Delivery address not found');
    }
}
