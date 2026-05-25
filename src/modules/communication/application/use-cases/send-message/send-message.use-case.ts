import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { Message } from '../../../domain/entities/message.entity';
import { MessageType } from '../../../domain/enums/message-type.enum';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import { MessageSentEvent } from '../../../domain/events/message-sent.event';
import {
    CONVERSATION_REPOSITORY,
    type ConversationRepository,
} from '../../ports/conversation.repository.port';
import {
    MESSAGE_REPOSITORY,
    type MessageRepository,
} from '../../ports/message.repository.port';
import type { SendMessageCommand } from './send-message.command';

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: ConversationRepository,
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: MessageRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: SendMessageCommand): Promise<Message> {
        const conversation = await this.conversationRepository.findById(
            UUID.create(command.conversationId),
        );

        if (!conversation) {
            throw new ConversationNotFoundError();
        }

        if (!conversation.isParticipant(command.senderUserId)) {
            throw new NotAConversationParticipantError();
        }

        const message = Message.create({
            conversationId: conversation.id,
            senderUserId: UUID.create(command.senderUserId),
            type: MessageType.USER,
            body: command.body,
        });

        await this.messageRepository.save(message);
        await this.eventPublisher.publishAll([
            new MessageSentEvent(message.id.value, conversation.id.value, command.senderUserId),
        ]);

        return message;
    }
}
