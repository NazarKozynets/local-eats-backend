import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidPaymentProviderError extends DomainError {
    readonly code = 'INVALID_PAYMENT_PROVIDER';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(provider: string) {
        super(`Invalid payment provider: ${provider}`);
    }
}
