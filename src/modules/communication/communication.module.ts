import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { CONVERSATION_REPOSITORY } from './application/ports/conversation.repository.port';
import { MESSAGE_REPOSITORY } from './application/ports/message.repository.port';
import { ORDER_COMMUNICATION_READER } from './application/ports/order-communication-reader.port';
import { DOMAIN_EVENT_PUBLISHER } from '../../shared/domain/events/domain-event-publisher.port';
import { PrismaConversationRepository } from './infrastructure/persistence/prisma-conversation.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { PrismaOrderCommunicationReader } from './infrastructure/readers/prisma-order-communication-reader';
import { NoopDomainEventPublisher } from '../../shared/infrastructure/events/noop-domain-event-publisher';
import { GetOrCreateOrderConversationUseCase } from './application/use-cases/get-or-create-order-conversation/get-or-create-order-conversation.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message/send-message.use-case';
import { GetConversationMessagesUseCase } from './application/use-cases/get-conversation-messages/get-conversation-messages.use-case';
import { MarkMessagesAsReadUseCase } from './application/use-cases/mark-messages-as-read/mark-messages-as-read.use-case';
import { GetMyUnreadCountUseCase } from './application/use-cases/get-my-unread-count/get-my-unread-count.use-case';
import { GetMyConversationsUseCase } from './application/use-cases/get-my-conversations/get-my-conversations.use-case';
import { GetConversationUseCase } from './application/use-cases/get-conversation/get-conversation.use-case';
import { CommunicationController } from './presentation/http/communication.controller';

@Module({
    imports: [IamModule],
    controllers: [CommunicationController],
    providers: [
        { provide: CONVERSATION_REPOSITORY, useClass: PrismaConversationRepository },
        { provide: MESSAGE_REPOSITORY, useClass: PrismaMessageRepository },
        { provide: ORDER_COMMUNICATION_READER, useClass: PrismaOrderCommunicationReader },
        { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },
        GetOrCreateOrderConversationUseCase,
        SendMessageUseCase,
        GetConversationMessagesUseCase,
        MarkMessagesAsReadUseCase,
        GetMyUnreadCountUseCase,
        GetMyConversationsUseCase,
        GetConversationUseCase,
    ],
})
export class CommunicationModule {}
