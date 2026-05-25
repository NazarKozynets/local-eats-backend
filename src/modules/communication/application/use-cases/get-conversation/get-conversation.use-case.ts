import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import type { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import {
    CONVERSATION_REPOSITORY,
    type ConversationRepository,
} from '../../ports/conversation.repository.port';
import type { GetConversationCommand } from './get-conversation.command';

@Injectable()
export class GetConversationUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: ConversationRepository,
    ) {}

    async execute(command: GetConversationCommand): Promise<Conversation> {
        const conversation = await this.conversationRepository.findById(
            UUID.create(command.conversationId),
        );

        if (!conversation) {
            throw new ConversationNotFoundError();
        }

        if (!conversation.isParticipant(command.currentUserId)) {
            throw new NotAConversationParticipantError();
        }

        return conversation;
    }
}
