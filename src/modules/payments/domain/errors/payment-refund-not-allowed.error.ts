import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PaymentRefundNotAllowedError extends DomainError {
    readonly code = 'PAYMENT_REFUND_NOT_ALLOWED';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(reason?: string) {
        super(reason ?? 'Payment cannot be refunded in its current state');
    }
}
