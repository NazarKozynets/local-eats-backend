import { GetPaymentByOrderUseCase } from './get-payment-by-order.use-case';
import { GetPaymentByOrderCommand } from './get-payment-by-order.command';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { PaymentAccessDeniedError } from '../../../domain/errors/payment-access-denied.error';
import {
    createMockPaymentRepository,
    createMockOrderPaymentReader,
} from '../../../__tests__/_helpers/mocks';
import {
    buildPayment,
    TEST_USER_ID,
    TEST_ORDER_ID,
    TEST_ADMIN_USER_ID,
} from '../../../__tests__/_helpers/builders';

describe('GetPaymentByOrderUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentReader: ReturnType<typeof createMockOrderPaymentReader>;
    let useCase: GetPaymentByOrderUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentReader = createMockOrderPaymentReader();

        useCase = new GetPaymentByOrderUseCase(paymentRepository, orderPaymentReader);

        paymentRepository.findByOrderId.mockResolvedValue(buildPayment());
        orderPaymentReader.canUserAccessOrderPayment.mockResolvedValue(true);
    });

    const command = (userId = TEST_USER_ID) =>
        GetPaymentByOrderCommand.create({ currentUserId: userId, orderId: TEST_ORDER_ID });

    it('customer can get own payment', async () => {
        const result = await useCase.execute(command());

        expect(result).toBeDefined();
        expect(result.orderId).toBe(TEST_ORDER_ID);
    });

    it('admin can get payment', async () => {
        const result = await useCase.execute(command(TEST_ADMIN_USER_ID));

        expect(result).toBeDefined();
    });

    it('unrelated user cannot access', async () => {
        orderPaymentReader.canUserAccessOrderPayment.mockResolvedValue(false);

        await expect(useCase.execute(command('other-user-id'))).rejects.toBeInstanceOf(PaymentAccessDeniedError);
    });

    it('fails if payment does not exist', async () => {
        paymentRepository.findByOrderId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentNotFoundError);
    });
});
