import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderNotReadyForDeliveryError extends DomainError {
    readonly code = 'ORDER_NOT_READY_FOR_DELIVERY';
    readonly httpStatus = HttpStatus.CONFLICT;
    constructor() { super('Order is not in READY_FOR_PICKUP status'); }
}
