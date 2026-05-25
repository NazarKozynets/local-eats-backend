import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class ConversationAccessDeniedError extends DomainError {
    readonly code = 'CONVERSATION_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Access to this conversation is denied');
    }
}
