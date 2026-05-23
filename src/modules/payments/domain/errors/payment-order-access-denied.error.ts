import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PaymentOrderAccessDeniedError extends DomainError {
    readonly code = 'PAYMENT_ORDER_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You do not have access to this order');
    }
}
