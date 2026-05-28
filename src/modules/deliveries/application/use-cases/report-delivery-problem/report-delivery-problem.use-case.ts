import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { UserRole } from '../../../../iam/domain/enums/user-role.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryProblemReport } from '../../../domain/entities/delivery-problem-report.entity';
import { DeliveryProblemReportedEvent } from '../../../domain/events/delivery-problem-reported.event';
import {
    ORDER_DELIVERY_READER,
    type OrderDeliveryReader,
} from '../../../../orders/application/ports/order-delivery-reader.port';
import {
    COURIER_ACCESS_READER,
    type CourierAccessReader,
} from '../../../../couriers/application/ports/courier-access-reader.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    DELIVERY_PROBLEM_REPORT_REPOSITORY,
    type DeliveryProblemReportRepository,
} from '../../ports/delivery-problem-report.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { ReportDeliveryProblemCommand } from './report-delivery-problem.command';

@Injectable()
export class ReportDeliveryProblemUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER) private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(COURIER_ACCESS_READER) private readonly courierAccessReader: CourierAccessReader,
        @Inject(RESTAURANT_ACCESS_READER) private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DELIVERY_PROBLEM_REPORT_REPOSITORY) private readonly reportRepository: DeliveryProblemReportRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: ReportDeliveryProblemCommand): Promise<DeliveryProblemReport> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        const isAdmin = command.reporterRole === UserRole.ADMIN;

        if (!isAdmin) {
            const isCustomer = order.customerUserId === command.reporterUserId;
            const courier = await this.courierAccessReader.findByUserId(command.reporterUserId);
            const isAssignedCourier = courier !== null && order.courierId === courier.courierProfileId;
            const isRestaurantStaff = await this.restaurantAccessReader.canManageRestaurant(
                command.reporterUserId,
                order.restaurantId,
            );

            if (!isCustomer && !isAssignedCourier && !isRestaurantStaff) {
                throw new DeliveryAccessDeniedError();
            }
        }

        const report = DeliveryProblemReport.create({
            id: UUID.create(randomUUID()),
            orderId: UUID.create(command.orderId),
            reportedByUserId: UUID.create(command.reporterUserId),
            type: command.type,
            description: command.description,
        });

        await this.reportRepository.save(report);

        await this.eventPublisher.publishAll([
            new DeliveryProblemReportedEvent(report.id.value, command.orderId, command.reporterUserId),
        ]);

        return report;
    }
}
