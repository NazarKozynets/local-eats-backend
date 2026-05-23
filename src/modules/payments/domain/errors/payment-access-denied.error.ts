import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PaymentAccessDeniedError extends DomainError {
    readonly code = 'PAYMENT_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Access to payment denied');
    }
}
