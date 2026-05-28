import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderAlreadyHasCourierError extends DomainError {
    readonly code = 'ORDER_ALREADY_HAS_COURIER';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Order already has a courier assigned');
    }
}
