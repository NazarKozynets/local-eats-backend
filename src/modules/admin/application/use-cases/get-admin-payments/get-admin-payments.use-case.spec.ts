import { GetAdminPaymentsUseCase } from './get-admin-payments.use-case';
import { createMockAdminPaymentReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminPayment } from '../../../__tests__/_helpers/builders';

describe('GetAdminPaymentsUseCase', () => {
    let paymentReader: ReturnType<typeof createMockAdminPaymentReader>;
    let useCase: GetAdminPaymentsUseCase;

    beforeEach(() => {
        paymentReader = createMockAdminPaymentReader();
        useCase = new GetAdminPaymentsUseCase(paymentReader);
    });

    it('returns payments from reader with filters', async () => {
        const payments = [buildAdminPayment()];
        paymentReader.findMany.mockResolvedValue(payments);
        const command = { page: 1, limit: 20, status: 'PAID' };

        const result = await useCase.execute(command);

        expect(result).toEqual(payments);
        expect(paymentReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no payments match', async () => {
        paymentReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({ status: 'REFUNDED' });

        expect(result).toEqual([]);
    });
});
