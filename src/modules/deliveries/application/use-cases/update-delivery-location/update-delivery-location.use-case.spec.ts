import { UpdateDeliveryLocationUseCase } from './update-delivery-location.use-case';
import { UpdateDeliveryLocationCommand } from './update-delivery-location.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_ORDER_ID,
    TEST_COURIER_PROFILE_ID,
    TEST_COURIER_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockCourierAccessReader,
    createMockCourierDeliveryWriter,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateDeliveryLocationUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let courierDeliveryWriter: ReturnType<typeof createMockCourierDeliveryWriter>;
    let useCase: UpdateDeliveryLocationUseCase;

    const command = () =>
        UpdateDeliveryLocationCommand.create({
            currentUserId: TEST_COURIER_USER_ID,
            orderId: TEST_ORDER_ID,
            latitude: 50.45,
            longitude: 30.52,
        });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        courierAccessReader = createMockCourierAccessReader();
        courierDeliveryWriter = createMockCourierDeliveryWriter();
        useCase = new UpdateDeliveryLocationUseCase(orderReader, courierAccessReader, courierDeliveryWriter);
        courierDeliveryWriter.updateLocation.mockResolvedValue(undefined);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('throws DeliveryAccessDeniedError when courier has no profile', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView());
        courierAccessReader.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('throws DeliveryAccessDeniedError when order is in a terminal status', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.DELIVERED }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('updates location for ASSIGNED_TO_COURIER status', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());

        await useCase.execute(command());

        expect(courierDeliveryWriter.updateLocation).toHaveBeenCalledWith(
            TEST_COURIER_PROFILE_ID,
            50.45,
            30.52,
        );
    });

    it('updates location for DELIVERING status', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.DELIVERING }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());

        await useCase.execute(command());

        expect(courierDeliveryWriter.updateLocation).toHaveBeenCalledWith(
            TEST_COURIER_PROFILE_ID,
            50.45,
            30.52,
        );
    });
});
