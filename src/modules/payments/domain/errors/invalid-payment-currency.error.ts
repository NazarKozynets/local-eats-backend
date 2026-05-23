import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidPaymentCurrencyError extends DomainError {
    readonly code = 'INVALID_PAYMENT_CURRENCY';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(currency: string) {
        super(`Invalid payment currency: ${currency}`);
    }
}
