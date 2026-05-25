import type { ConversationRepository } from '../../application/ports/conversation.repository.port';
import type { MessageRepository } from '../../application/ports/message.repository.port';
import type { OrderCommunicationReader } from '../../application/ports/order-communication-reader.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockConversationRepository(): jest.Mocked<ConversationRepository> {
    return {
        findById: jest.fn(),
        findByOrderId: jest.fn(),
        findManyByUserId: jest.fn(),
        save: jest.fn(),
        saveParticipant: jest.fn(),
    };
}

export function createMockMessageRepository(): jest.Mocked<MessageRepository> {
    return {
        findById: jest.fn(),
        findManyByConversationId: jest.fn(),
        save: jest.fn(),
        markMessagesAsRead: jest.fn(),
        countUnreadByParticipantId: jest.fn(),
    };
}

export function createMockOrderCommunicationReader(): jest.Mocked<OrderCommunicationReader> {
    return {
        findOrderForConversation: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
