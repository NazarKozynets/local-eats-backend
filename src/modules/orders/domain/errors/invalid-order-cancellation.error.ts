import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidOrderCancellationError extends DomainError {
    readonly code = 'INVALID_ORDER_CANCELLATION';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Order can only be cancelled while it is in CREATED status');
    }
}
