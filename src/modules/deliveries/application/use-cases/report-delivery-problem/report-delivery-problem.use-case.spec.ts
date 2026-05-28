import { ReportDeliveryProblemUseCase } from './report-delivery-problem.use-case';
import { ReportDeliveryProblemCommand } from './report-delivery-problem.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryProblemReportedEvent } from '../../../domain/events/delivery-problem-reported.event';
import { DeliveryProblemType } from '../../../domain/enums/delivery-problem-type.enum';
import { DeliveryProblemStatus } from '../../../domain/enums/delivery-problem-status.enum';
import { UserRole } from '../../../../iam/domain/enums/user-role.enum';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_ORDER_ID,
    TEST_COURIER_PROFILE_ID,
    TEST_COURIER_USER_ID,
    TEST_CUSTOMER_USER_ID,
    TEST_MANAGER_USER_ID,
    TEST_ADMIN_USER_ID,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockCourierAccessReader,
    createMockRestaurantAccessReader,
    createMockDeliveryProblemReportRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('ReportDeliveryProblemUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let reportRepository: ReturnType<typeof createMockDeliveryProblemReportRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ReportDeliveryProblemUseCase;

    const customerCommand = () =>
        ReportDeliveryProblemCommand.create({
            reporterUserId: TEST_CUSTOMER_USER_ID,
            reporterRole: UserRole.CUSTOMER,
            orderId: TEST_ORDER_ID,
            type: DeliveryProblemType.OTHER,
            description: 'Problem description',
        });

    const adminCommand = () =>
        ReportDeliveryProblemCommand.create({
            reporterUserId: TEST_ADMIN_USER_ID,
            reporterRole: UserRole.ADMIN,
            orderId: TEST_ORDER_ID,
            type: DeliveryProblemType.MISSING_ITEMS,
            description: 'Admin report',
        });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        courierAccessReader = createMockCourierAccessReader();
        restaurantAccessReader = createMockRestaurantAccessReader();
        reportRepository = createMockDeliveryProblemReportRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new ReportDeliveryProblemUseCase(
            orderReader,
            courierAccessReader,
            restaurantAccessReader,
            reportRepository,
            eventPublisher,
        );
        reportRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(customerCommand())).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('throws DeliveryAccessDeniedError when reporter is unrelated non-admin', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ customerUserId: 'other-user' }),
        );
        courierAccessReader.findByUserId.mockResolvedValue(null);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);
        await expect(useCase.execute(customerCommand())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('allows customer to report a problem', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ customerUserId: TEST_CUSTOMER_USER_ID }),
        );
        courierAccessReader.findByUserId.mockResolvedValue(null);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        const report = await useCase.execute(customerCommand());

        expect(report.status).toBe(DeliveryProblemStatus.OPEN);
        expect(report.type).toBe(DeliveryProblemType.OTHER);
        expect(reportRepository.save).toHaveBeenCalled();
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(DeliveryProblemReportedEvent)]),
        );
    });

    it('allows assigned courier to report a problem', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ courierId: TEST_COURIER_PROFILE_ID }),
        );
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());

        const cmd = ReportDeliveryProblemCommand.create({
            reporterUserId: TEST_COURIER_USER_ID,
            reporterRole: UserRole.COURIER,
            orderId: TEST_ORDER_ID,
            type: DeliveryProblemType.WRONG_ADDRESS,
            description: 'Wrong address given',
        });

        const report = await useCase.execute(cmd);
        expect(report.status).toBe(DeliveryProblemStatus.OPEN);
    });

    it('allows admin to bypass access check', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView());

        const report = await useCase.execute(adminCommand());
        expect(report).toBeDefined();
        expect(courierAccessReader.findByUserId).not.toHaveBeenCalled();
    });
});
