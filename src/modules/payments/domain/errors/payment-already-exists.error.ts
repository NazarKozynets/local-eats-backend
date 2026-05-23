import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PaymentAlreadyExistsError extends DomainError {
    readonly code = 'PAYMENT_ALREADY_EXISTS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Payment already exists for this order');
    }
}
