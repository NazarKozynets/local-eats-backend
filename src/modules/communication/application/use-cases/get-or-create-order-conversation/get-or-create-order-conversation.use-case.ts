import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../../shared/domain/events/domain-event.base';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationType } from '../../../domain/enums/conversation-type.enum';
import { ConversationParticipantRole } from '../../../domain/enums/conversation-participant-role.enum';
import { ConversationCreatedEvent } from '../../../domain/events/conversation-created.event';
import { OrderNotFoundForConversationError } from '../../../domain/errors/order-not-found-for-conversation.error';
import { OrderConversationAccessDeniedError } from '../../../domain/errors/order-conversation-access-denied.error';
import {
    CONVERSATION_REPOSITORY,
    type ConversationRepository,
} from '../../ports/conversation.repository.port';
import {
    ORDER_COMMUNICATION_READER,
    type OrderCommunicationReader,
} from '../../ports/order-communication-reader.port';
import type { GetOrCreateOrderConversationCommand } from './get-or-create-order-conversation.command';

@Injectable()
export class GetOrCreateOrderConversationUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: ConversationRepository,
        @Inject(ORDER_COMMUNICATION_READER)
        private readonly orderReader: OrderCommunicationReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: GetOrCreateOrderConversationCommand): Promise<Conversation> {
        const order = await this.orderReader.findOrderForConversation(command.orderId);
        if (!order) {
            throw new OrderNotFoundForConversationError();
        }

        const isCustomer = order.customerUserId === command.currentUserId;
        const isCourier = order.courierUserId !== null && order.courierUserId === command.currentUserId;
        const isAdmin = command.currentUserRole === 'ADMIN';
        const isRestaurantStaff = order.restaurantStaffUserIds.includes(command.currentUserId);

        if (!isCustomer && !isCourier && !isAdmin && !isRestaurantStaff) {
            throw new OrderConversationAccessDeniedError();
        }

        let conversation = await this.conversationRepository.findByOrderId(command.orderId);
        const events: DomainEvent[] = [];

        if (!conversation) {
            conversation = Conversation.create({
                orderId: UUID.create(command.orderId),
                type: ConversationType.ORDER,
            });

            conversation.addParticipant(UUID.create(order.customerUserId), ConversationParticipantRole.CUSTOMER);

            if (order.courierUserId) {
                conversation.addParticipant(UUID.create(order.courierUserId), ConversationParticipantRole.COURIER);
            }

            await this.conversationRepository.save(conversation);
            events.push(new ConversationCreatedEvent(conversation.id.value, command.orderId));
        } else if (!conversation.isParticipant(command.currentUserId)) {
            const role = this.resolveRole(command.currentUserRole, isCustomer, isCourier, isRestaurantStaff);
            const participant = conversation.addParticipant(UUID.create(command.currentUserId), role);
            await this.conversationRepository.saveParticipant(participant);
        }

        if (events.length > 0) {
            await this.eventPublisher.publishAll(events);
        }

        return conversation;
    }

    private resolveRole(
        userRole: string,
        isCustomer: boolean,
        isCourier: boolean,
        isRestaurantStaff: boolean,
    ): ConversationParticipantRole {
        if (isCustomer) return ConversationParticipantRole.CUSTOMER;
        if (isCourier) return ConversationParticipantRole.COURIER;
        if (isRestaurantStaff) return ConversationParticipantRole.RESTAURANT_MANAGER;
        if (userRole === 'ADMIN') return ConversationParticipantRole.ADMIN;
        return ConversationParticipantRole.RESTAURANT_MANAGER;
    }
}
