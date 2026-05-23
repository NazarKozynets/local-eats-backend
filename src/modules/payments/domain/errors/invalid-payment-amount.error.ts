import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidPaymentAmountError extends DomainError {
    readonly code = 'INVALID_PAYMENT_AMOUNT';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Payment amount must be greater than zero');
    }
}
