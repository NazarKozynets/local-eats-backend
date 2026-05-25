import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderNotReviewableError extends DomainError {
    readonly code = 'ORDER_NOT_REVIEWABLE';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(reason: string) {
        super(reason);
    }
}
