import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class ConversationNotFoundError extends DomainError {
    readonly code = 'CONVERSATION_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Conversation not found');
    }
}
