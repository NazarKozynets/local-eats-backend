import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import type { Message } from '../../../domain/entities/message.entity';
import {
    CONVERSATION_REPOSITORY,
    type ConversationRepository,
} from '../../ports/conversation.repository.port';
import {
    MESSAGE_REPOSITORY,
    type MessageRepository,
} from '../../ports/message.repository.port';
import type { GetConversationMessagesCommand } from './get-conversation-messages.command';

@Injectable()
export class GetConversationMessagesUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: ConversationRepository,
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(command: GetConversationMessagesCommand): Promise<Message[]> {
        const conversation = await this.conversationRepository.findById(
            UUID.create(command.conversationId),
        );

        if (!conversation) {
            throw new ConversationNotFoundError();
        }

        if (!conversation.isParticipant(command.currentUserId)) {
            throw new NotAConversationParticipantError();
        }

        return this.messageRepository.findManyByConversationId(command.conversationId, {
            page: command.page,
            limit: command.limit,
        });
    }
}
