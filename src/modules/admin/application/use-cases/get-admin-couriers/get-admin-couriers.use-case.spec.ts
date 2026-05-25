import { GetAdminCouriersUseCase } from './get-admin-couriers.use-case';
import { createMockAdminCourierReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminCourier } from '../../../__tests__/_helpers/builders';

describe('GetAdminCouriersUseCase', () => {
    let courierReader: ReturnType<typeof createMockAdminCourierReader>;
    let useCase: GetAdminCouriersUseCase;

    beforeEach(() => {
        courierReader = createMockAdminCourierReader();
        useCase = new GetAdminCouriersUseCase(courierReader);
    });

    it('returns couriers from reader with filters', async () => {
        const couriers = [buildAdminCourier()];
        courierReader.findMany.mockResolvedValue(couriers);
        const command = { page: 1, limit: 20, profileStatus: 'ACTIVE' };

        const result = await useCase.execute(command);

        expect(result).toEqual(couriers);
        expect(courierReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no couriers match', async () => {
        courierReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({ verificationStatus: 'PENDING' });

        expect(result).toEqual([]);
    });
});
