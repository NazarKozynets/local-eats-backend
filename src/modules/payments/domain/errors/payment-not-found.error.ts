import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PaymentNotFoundError extends DomainError {
    readonly code = 'PAYMENT_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Payment not found');
    }
}
