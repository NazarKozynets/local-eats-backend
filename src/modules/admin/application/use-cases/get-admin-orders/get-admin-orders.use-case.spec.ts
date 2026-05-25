import { GetAdminOrdersUseCase } from './get-admin-orders.use-case';
import { createMockAdminOrderReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminOrder } from '../../../__tests__/_helpers/builders';

describe('GetAdminOrdersUseCase', () => {
    let orderReader: ReturnType<typeof createMockAdminOrderReader>;
    let useCase: GetAdminOrdersUseCase;

    beforeEach(() => {
        orderReader = createMockAdminOrderReader();
        useCase = new GetAdminOrdersUseCase(orderReader);
    });

    it('returns orders from reader with filters', async () => {
        const orders = [buildAdminOrder()];
        orderReader.findMany.mockResolvedValue(orders);
        const command = { page: 1, limit: 20, status: 'DELIVERED' };

        const result = await useCase.execute(command);

        expect(result).toEqual(orders);
        expect(orderReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no orders match', async () => {
        orderReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({ status: 'PROBLEM' });

        expect(result).toEqual([]);
    });
});
