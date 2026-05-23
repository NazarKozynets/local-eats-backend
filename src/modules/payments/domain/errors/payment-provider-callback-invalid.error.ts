import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PaymentProviderCallbackInvalidError extends DomainError {
    readonly code = 'PAYMENT_PROVIDER_CALLBACK_INVALID';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(reason?: string) {
        super(reason ?? 'Invalid payment provider callback payload');
    }
}
