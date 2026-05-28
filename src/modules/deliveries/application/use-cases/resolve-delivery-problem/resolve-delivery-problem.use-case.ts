import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { DeliveryProblemReportNotFoundError } from '../../../domain/errors/delivery-problem-report-not-found.error';
import { DeliveryProblemResolvedEvent } from '../../../domain/events/delivery-problem-resolved.event';
import {
    DELIVERY_PROBLEM_REPORT_REPOSITORY,
    type DeliveryProblemReportRepository,
} from '../../ports/delivery-problem-report.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { ResolveDeliveryProblemCommand } from './resolve-delivery-problem.command';
import type { DeliveryProblemReport } from '../../../domain/entities/delivery-problem-report.entity';

@Injectable()
export class ResolveDeliveryProblemUseCase {
    constructor(
        @Inject(DELIVERY_PROBLEM_REPORT_REPOSITORY) private readonly reportRepository: DeliveryProblemReportRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: ResolveDeliveryProblemCommand): Promise<DeliveryProblemReport> {
        const report = await this.reportRepository.findById(UUID.create(command.problemReportId));
        if (!report) throw new DeliveryProblemReportNotFoundError();

        report.resolve(new Date());
        await this.reportRepository.save(report);

        await this.eventPublisher.publishAll([
            new DeliveryProblemResolvedEvent(report.id.value, report.orderId.value, command.adminUserId),
        ]);

        return report;
    }
}
