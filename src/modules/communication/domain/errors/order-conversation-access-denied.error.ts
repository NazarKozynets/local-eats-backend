import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderConversationAccessDeniedError extends DomainError {
    readonly code = 'ORDER_CONVERSATION_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You do not have access to this order conversation');
    }
}
