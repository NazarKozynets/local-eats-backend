import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidOrderQuantityError extends DomainError {
    readonly code = 'INVALID_ORDER_QUANTITY';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Order item quantity must be a positive integer');
    }
}
