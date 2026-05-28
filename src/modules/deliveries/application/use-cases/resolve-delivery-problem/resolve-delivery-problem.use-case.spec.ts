import { ResolveDeliveryProblemUseCase } from './resolve-delivery-problem.use-case';
import { ResolveDeliveryProblemCommand } from './resolve-delivery-problem.command';
import { DeliveryProblemReportNotFoundError } from '../../../domain/errors/delivery-problem-report-not-found.error';
import { DeliveryProblemAlreadyResolvedError } from '../../../domain/errors/delivery-problem-already-resolved.error';
import { DeliveryProblemResolvedEvent } from '../../../domain/events/delivery-problem-resolved.event';
import { DeliveryProblemStatus } from '../../../domain/enums/delivery-problem-status.enum';
import {
    buildDeliveryProblemReport,
    TEST_PROBLEM_REPORT_ID,
    TEST_ADMIN_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockDeliveryProblemReportRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('ResolveDeliveryProblemUseCase', () => {
    let reportRepository: ReturnType<typeof createMockDeliveryProblemReportRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ResolveDeliveryProblemUseCase;

    const command = () =>
        ResolveDeliveryProblemCommand.create({
            adminUserId: TEST_ADMIN_USER_ID,
            problemReportId: TEST_PROBLEM_REPORT_ID,
        });

    beforeEach(() => {
        reportRepository = createMockDeliveryProblemReportRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new ResolveDeliveryProblemUseCase(reportRepository, eventPublisher);
        reportRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('throws DeliveryProblemReportNotFoundError when report does not exist', async () => {
        reportRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryProblemReportNotFoundError);
    });

    it('throws DeliveryProblemAlreadyResolvedError when report is already resolved', async () => {
        reportRepository.findById.mockResolvedValue(
            buildDeliveryProblemReport({ status: DeliveryProblemStatus.RESOLVED }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryProblemAlreadyResolvedError);
    });

    it('resolves the report and publishes event on success', async () => {
        const report = buildDeliveryProblemReport({ status: DeliveryProblemStatus.OPEN });
        reportRepository.findById.mockResolvedValue(report);

        const result = await useCase.execute(command());

        expect(result.status).toBe(DeliveryProblemStatus.RESOLVED);
        expect(result.resolvedAt).toBeInstanceOf(Date);
        expect(reportRepository.save).toHaveBeenCalledWith(report);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(DeliveryProblemResolvedEvent)]),
        );
    });
});
