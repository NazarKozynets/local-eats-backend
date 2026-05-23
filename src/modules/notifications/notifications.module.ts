import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { NOTIFICATION_REPOSITORY } from './application/ports/notification.repository.port';
import { DOMAIN_EVENT_PUBLISHER } from '../../shared/domain/events/domain-event-publisher.port';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { NoopDomainEventPublisher } from '../../shared/infrastructure/events/noop-domain-event-publisher';
import { NotificationAccessPolicy } from './application/services/notification-access-policy';
import { NotificationFactory } from './application/services/notification-factory';
import { CreateNotificationUseCase } from './application/use-cases/create-notification/create-notification.use-case';
import { GetMyNotificationsUseCase } from './application/use-cases/get-my-notifications/get-my-notifications.use-case';
import { GetMyUnreadNotificationsCountUseCase } from './application/use-cases/get-my-unread-notifications-count/get-my-unread-notifications-count.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from './application/use-cases/mark-all-notifications-as-read/mark-all-notifications-as-read.use-case';
import { OnOrderCreatedHandler } from './application/event-handlers/on-order-created.handler';
import { OnOrderStatusChangedHandler } from './application/event-handlers/on-order-status-changed.handler';
import { OnCourierApprovedHandler } from './application/event-handlers/on-courier-approved.handler';
import { OnCourierRejectedHandler } from './application/event-handlers/on-courier-rejected.handler';
import { NotificationsController } from './presentation/http/notifications.controller';
import { AdminNotificationsController } from './presentation/http/admin-notifications.controller';

@Module({
    imports: [IamModule],
    controllers: [
        NotificationsController,
        AdminNotificationsController,
    ],
    providers: [
        { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
        { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },
        NotificationAccessPolicy,
        NotificationFactory,
        CreateNotificationUseCase,
        GetMyNotificationsUseCase,
        GetMyUnreadNotificationsCountUseCase,
        MarkNotificationAsReadUseCase,
        MarkAllNotificationsAsReadUseCase,
        OnOrderCreatedHandler,
        OnOrderStatusChangedHandler,
        OnCourierApprovedHandler,
        OnCourierRejectedHandler,
    ],
})
export class NotificationsModule {}
