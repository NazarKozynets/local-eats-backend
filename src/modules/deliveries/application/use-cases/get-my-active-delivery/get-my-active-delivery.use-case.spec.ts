import { GetMyActiveDeliveryUseCase } from './get-my-active-delivery.use-case';
import { GetMyActiveDeliveryCommand } from './get-my-active-delivery.command';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_COURIER_USER_ID,
    TEST_COURIER_PROFILE_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockCourierAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetMyActiveDeliveryUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let useCase: GetMyActiveDeliveryUseCase;

    const command = () =>
        GetMyActiveDeliveryCommand.create({ currentUserId: TEST_COURIER_USER_ID });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        courierAccessReader = createMockCourierAccessReader();
        useCase = new GetMyActiveDeliveryUseCase(orderReader, courierAccessReader);
    });

    it('returns null when courier has no profile', async () => {
        courierAccessReader.findByUserId.mockResolvedValue(null);
        const result = await useCase.execute(command());
        expect(result).toBeNull();
    });

    it('returns null when courier has no active delivery', async () => {
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        orderReader.findActiveDeliveryByCourierId.mockResolvedValue(null);
        const result = await useCase.execute(command());
        expect(result).toBeNull();
    });

    it('returns the active delivery when found', async () => {
        const delivery = buildOrderDeliveryView();
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        orderReader.findActiveDeliveryByCourierId.mockResolvedValue(delivery);

        const result = await useCase.execute(command());

        expect(orderReader.findActiveDeliveryByCourierId).toHaveBeenCalledWith(TEST_COURIER_PROFILE_ID);
        expect(result).toBe(delivery);
    });
});
