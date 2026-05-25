import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class NotAConversationParticipantError extends DomainError {
    readonly code = 'NOT_A_CONVERSATION_PARTICIPANT';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You are not a participant of this conversation');
    }
}
