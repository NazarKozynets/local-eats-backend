import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';
import type { PaymentStatus } from '../enums/payment-status.enum';

export class InvalidPaymentStatusTransitionError extends DomainError {
    readonly code = 'INVALID_PAYMENT_STATUS_TRANSITION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(from: PaymentStatus, to: PaymentStatus) {
        super(`Cannot transition payment from ${from} to ${to}`);
    }
}
