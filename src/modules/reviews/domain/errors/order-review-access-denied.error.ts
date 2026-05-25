import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderReviewAccessDeniedError extends DomainError {
    readonly code = 'ORDER_REVIEW_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You are not the customer of this order and cannot review it');
    }
}
