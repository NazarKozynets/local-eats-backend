import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { PaymentsModule } from '../payments/payments.module';
import { CouriersModule } from '../couriers/couriers.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { NOTIFICATION_REPOSITORY } from './application/ports/notification.repository.port';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { InProcessDomainEventPublisher } from '../../shared/infrastructure/events/in-process-domain-event-publisher';
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
import { OnPaymentPaidHandler } from './application/event-handlers/on-payment-paid.handler';
import { OnPaymentFailedHandler } from './application/event-handlers/on-payment-failed.handler';
import { OnPaymentRefundedHandler } from './application/event-handlers/on-payment-refunded.handler';
import { OnDeliveryAssignedHandler } from './application/event-handlers/on-delivery-assigned.handler';
import { OnOrderDeliveredHandler } from './application/event-handlers/on-order-delivered.handler';
import { OnRestaurantApprovedHandler } from './application/event-handlers/on-restaurant-approved.handler';
import { OnRestaurantRejectedHandler } from './application/event-handlers/on-restaurant-rejected.handler';
import { NotificationsController } from './presentation/http/notifications.controller';
import { AdminNotificationsController } from './presentation/http/admin-notifications.controller';
import { OrderCreatedEvent } from '../orders/domain/events/order-created.event';
import { OrderStatusChangedEvent } from '../orders/domain/events/order-status-changed.event';
import { CourierApprovedEvent } from '../couriers/domain/events/courier-approved.event';
import { CourierRejectedEvent } from '../couriers/domain/events/courier-rejected.event';
import { PaymentPaidEvent } from '../payments/domain/events/payment-paid.event';
import { PaymentFailedEvent } from '../payments/domain/events/payment-failed.event';
import { PaymentRefundedEvent } from '../payments/domain/events/payment-refunded.event';
import { DeliveryAssignedEvent } from '../deliveries/domain/events/delivery-assigned.event';
import { OrderDeliveredEvent } from '../deliveries/domain/events/order-delivered.event';
import { RestaurantApprovedEvent } from '../restaurants/domain/events/restaurant-approved.event';
import { RestaurantRejectedEvent } from '../restaurants/domain/events/restaurant-rejected.event';

@Module({
    imports: [IamModule, PaymentsModule, CouriersModule, RestaurantsModule],
    controllers: [
        NotificationsController,
        AdminNotificationsController,
    ],
    providers: [
        { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
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
        OnPaymentPaidHandler,
        OnPaymentFailedHandler,
        OnPaymentRefundedHandler,
        OnDeliveryAssignedHandler,
        OnOrderDeliveredHandler,
        OnRestaurantApprovedHandler,
        OnRestaurantRejectedHandler,
    ],
})
export class NotificationsModule implements OnModuleInit {
    constructor(
        @Inject(InProcessDomainEventPublisher)
        private readonly publisher: InProcessDomainEventPublisher,
        private readonly onOrderCreated: OnOrderCreatedHandler,
        private readonly onOrderStatusChanged: OnOrderStatusChangedHandler,
        private readonly onCourierApproved: OnCourierApprovedHandler,
        private readonly onCourierRejected: OnCourierRejectedHandler,
        private readonly onPaymentPaid: OnPaymentPaidHandler,
        private readonly onPaymentFailed: OnPaymentFailedHandler,
        private readonly onPaymentRefunded: OnPaymentRefundedHandler,
        private readonly onDeliveryAssigned: OnDeliveryAssignedHandler,
        private readonly onOrderDelivered: OnOrderDeliveredHandler,
        private readonly onRestaurantApproved: OnRestaurantApprovedHandler,
        private readonly onRestaurantRejected: OnRestaurantRejectedHandler,
    ) {}

    onModuleInit(): void {
        this.publisher.subscribe(OrderCreatedEvent, e => this.onOrderCreated.handle(e));
        this.publisher.subscribe(OrderStatusChangedEvent, e => this.onOrderStatusChanged.handle(e));
        this.publisher.subscribe(CourierApprovedEvent, e => this.onCourierApproved.handle(e));
        this.publisher.subscribe(CourierRejectedEvent, e => this.onCourierRejected.handle(e));
        this.publisher.subscribe(PaymentPaidEvent, e => this.onPaymentPaid.handle(e));
        this.publisher.subscribe(PaymentFailedEvent, e => this.onPaymentFailed.handle(e));
        this.publisher.subscribe(PaymentRefundedEvent, e => this.onPaymentRefunded.handle(e));
        this.publisher.subscribe(DeliveryAssignedEvent, e => this.onDeliveryAssigned.handle(e));
        this.publisher.subscribe(OrderDeliveredEvent, e => this.onOrderDelivered.handle(e));
        this.publisher.subscribe(RestaurantApprovedEvent, e => this.onRestaurantApproved.handle(e));
        this.publisher.subscribe(RestaurantRejectedEvent, e => this.onRestaurantRejected.handle(e));
    }
}
