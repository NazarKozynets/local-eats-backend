import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { Conversation } from '../../domain/entities/conversation.entity';
import { ConversationParticipant } from '../../domain/entities/conversation-participant.entity';
import { Message } from '../../domain/entities/message.entity';
import { ConversationType } from '../../domain/enums/conversation-type.enum';
import { ConversationParticipantRole } from '../../domain/enums/conversation-participant-role.enum';
import { MessageType } from '../../domain/enums/message-type.enum';
import type { OrderCommunicationReadModel } from '../../application/ports/order-communication-reader.port';

export const TEST_CONVERSATION_ID = '550e8400-e29b-41d4-a716-446655440010';
export const TEST_ORDER_ID = '550e8400-e29b-41d4-a716-446655440011';
export const TEST_CUSTOMER_USER_ID = '550e8400-e29b-41d4-a716-446655440012';
export const TEST_CUSTOMER_PROFILE_ID = '550e8400-e29b-41d4-a716-446655440013';
export const TEST_RESTAURANT_ID = '550e8400-e29b-41d4-a716-446655440014';
export const TEST_COURIER_USER_ID = '550e8400-e29b-41d4-a716-446655440015';
export const TEST_COURIER_PROFILE_ID = '550e8400-e29b-41d4-a716-446655440016';
export const TEST_PARTICIPANT_ID = '550e8400-e29b-41d4-a716-446655440017';
export const TEST_MESSAGE_ID = '550e8400-e29b-41d4-a716-446655440018';
export const TEST_OTHER_USER_ID = '550e8400-e29b-41d4-a716-446655440019';

export function buildParticipant(overrides: Partial<{
    id: string; conversationId: string; userId: string; role: ConversationParticipantRole;
}> = {}): ConversationParticipant {
    return ConversationParticipant.restore({
        id: UUID.create(overrides.id ?? TEST_PARTICIPANT_ID),
        conversationId: UUID.create(overrides.conversationId ?? TEST_CONVERSATION_ID),
        userId: UUID.create(overrides.userId ?? TEST_CUSTOMER_USER_ID),
        role: overrides.role ?? ConversationParticipantRole.CUSTOMER,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    });
}

export function buildConversation(overrides: Partial<{
    id: string; orderId: string; participants: ConversationParticipant[];
}> = {}): Conversation {
    const participant = buildParticipant();
    return Conversation.restore({
        id: UUID.create(overrides.id ?? TEST_CONVERSATION_ID),
        orderId: UUID.create(overrides.orderId ?? TEST_ORDER_ID),
        type: ConversationType.ORDER,
        participants: overrides.participants ?? [participant],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    });
}

export function buildMessage(overrides: Partial<{
    id: string; conversationId: string; senderUserId: string; body: string;
}> = {}): Message {
    return Message.restore({
        id: UUID.create(overrides.id ?? TEST_MESSAGE_ID),
        conversationId: UUID.create(overrides.conversationId ?? TEST_CONVERSATION_ID),
        senderUserId: UUID.create(overrides.senderUserId ?? TEST_CUSTOMER_USER_ID),
        type: MessageType.USER,
        body: overrides.body ?? 'Hello',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    });
}

export function buildOrderReadModel(overrides: Partial<OrderCommunicationReadModel> = {}): OrderCommunicationReadModel {
    return {
        orderId: TEST_ORDER_ID,
        customerId: TEST_CUSTOMER_PROFILE_ID,
        customerUserId: TEST_CUSTOMER_USER_ID,
        restaurantId: TEST_RESTAURANT_ID,
        restaurantStaffUserIds: [],
        courierId: TEST_COURIER_PROFILE_ID,
        courierUserId: TEST_COURIER_USER_ID,
        ...overrides,
    };
}
