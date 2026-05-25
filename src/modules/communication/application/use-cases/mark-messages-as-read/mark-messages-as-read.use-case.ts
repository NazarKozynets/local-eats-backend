import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import { MessagesMarkedAsReadEvent } from '../../../domain/events/messages-marked-as-read.event';
import {
    CONVERSATION_REPOSITORY,
    type ConversationRepository,
} from '../../ports/conversation.repository.port';
import {
    MESSAGE_REPOSITORY,
    type MessageRepository,
} from '../../ports/message.repository.port';
import type { MarkMessagesAsReadCommand } from './mark-messages-as-read.command';

@Injectable()
export class MarkMessagesAsReadUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: ConversationRepository,
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: MessageRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: MarkMessagesAsReadCommand): Promise<void> {
        const conversation = await this.conversationRepository.findById(
            UUID.create(command.conversationId),
        );

        if (!conversation) {
            throw new ConversationNotFoundError();
        }

        const participant = conversation.findParticipant(command.currentUserId);
        if (!participant) {
            throw new NotAConversationParticipantError();
        }

        const markedCount = await this.messageRepository.markMessagesAsRead(
            command.conversationId,
            participant.id.value,
        );

        if (markedCount > 0) {
            await this.eventPublisher.publishAll([
                new MessagesMarkedAsReadEvent(
                    command.conversationId,
                    participant.id.value,
                    markedCount,
                ),
            ]);
        }
    }
}
