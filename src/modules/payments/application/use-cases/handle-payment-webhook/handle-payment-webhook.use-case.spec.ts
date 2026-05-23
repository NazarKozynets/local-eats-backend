import { HandlePaymentWebhookUseCase } from './handle-payment-webhook.use-case';
import { HandlePaymentWebhookCommand } from './handle-payment-webhook.command';
import { PaymentProvider } from '../../../domain/enums/payment-provider.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { PaymentProviderCallbackInvalidError } from '../../../domain/errors/payment-provider-callback-invalid.error';
import { InvalidPaymentStatusTransitionError } from '../../../domain/errors/invalid-payment-status-transition.error';
import { MockCardPaymentProvider } from '../../../../payments/infrastructure/providers/mock-card-payment.provider';
import {
    createMockPaymentRepository,
    createMockOrderPaymentWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import {
    buildPayment,
    TEST_PAYMENT_ID,
    TEST_ORDER_ID,
} from '../../../__tests__/_helpers/builders';

describe('HandlePaymentWebhookUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentWriter: ReturnType<typeof createMockOrderPaymentWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let mockProvider: MockCardPaymentProvider;
    let useCase: HandlePaymentWebhookUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentWriter = createMockOrderPaymentWriter();
        eventPublisher = createMockEventPublisher();
        mockProvider = new MockCardPaymentProvider();

        useCase = new HandlePaymentWebhookUseCase(
            paymentRepository,
            orderPaymentWriter,
            eventPublisher,
            [mockProvider],
        );

        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PENDING }));
        paymentRepository.update.mockResolvedValue(undefined);
        orderPaymentWriter.updateOrderPaymentStatus.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('handles paid webhook and marks payment as PAID', async () => {
        const cmd = HandlePaymentWebhookCommand.create({
            provider: PaymentProvider.MOCK,
            payload: {
                paymentId: TEST_PAYMENT_ID,
                status: 'PAID',
                providerPaymentId: 'prov_123',
            },
        });

        await useCase.execute(cmd);

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.status).toBe(PaymentStatus.PAID);
        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(
            TEST_ORDER_ID,
            PaymentStatus.PAID,
        );
    });

    it('handles failed webhook and marks payment as FAILED', async () => {
        const cmd = HandlePaymentWebhookCommand.create({
            provider: PaymentProvider.MOCK,
            payload: {
                paymentId: TEST_PAYMENT_ID,
                status: 'FAILED',
                failureReason: 'Card expired',
            },
        });

        await useCase.execute(cmd);

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.status).toBe(PaymentStatus.FAILED);
        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(
            TEST_ORDER_ID,
            PaymentStatus.FAILED,
        );
    });

    it('rejects invalid provider payload (missing paymentId)', async () => {
        const cmd = HandlePaymentWebhookCommand.create({
            provider: PaymentProvider.MOCK,
            payload: { status: 'PAID' },
        });

        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(PaymentProviderCallbackInvalidError);
    });

    it('fails if payment not found', async () => {
        paymentRepository.findById.mockResolvedValue(null);

        const cmd = HandlePaymentWebhookCommand.create({
            provider: PaymentProvider.MOCK,
            payload: { paymentId: TEST_PAYMENT_ID, status: 'PAID' },
        });

        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(PaymentNotFoundError);
    });

    it('throws PaymentProviderCallbackInvalidError for unknown provider', async () => {
        const cmd = HandlePaymentWebhookCommand.create({
            provider: PaymentProvider.CASH,
            payload: { paymentId: TEST_PAYMENT_ID, status: 'PAID' },
        });

        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(PaymentProviderCallbackInvalidError);
    });
});
