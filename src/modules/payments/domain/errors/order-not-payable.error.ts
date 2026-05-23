import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderNotPayableError extends DomainError {
    readonly code = 'ORDER_NOT_PAYABLE';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(reason?: string) {
        super(reason ?? 'Order is not in a payable state');
    }
}
