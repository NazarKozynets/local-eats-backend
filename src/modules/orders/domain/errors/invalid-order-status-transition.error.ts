import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';
import type { OrderStatus } from '../enums/order-status.enum';

export class InvalidOrderStatusTransitionError extends DomainError {
    readonly code = 'INVALID_ORDER_STATUS_TRANSITION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(from: OrderStatus, to: OrderStatus) {
        super(`Cannot transition order from ${from} to ${to}`, { from, to });
    }
}
