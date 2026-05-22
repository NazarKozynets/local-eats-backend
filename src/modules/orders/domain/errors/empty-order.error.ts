import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class EmptyOrderError extends DomainError {
    readonly code = 'EMPTY_ORDER';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Order must contain at least one item');
    }
}
