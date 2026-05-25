import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderNotFoundForConversationError extends DomainError {
    readonly code = 'ORDER_NOT_FOUND_FOR_CONVERSATION';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Order not found');
    }
}
