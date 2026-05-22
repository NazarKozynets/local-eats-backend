import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidOrderItemsError extends DomainError {
    readonly code = 'INVALID_ORDER_ITEMS';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}
