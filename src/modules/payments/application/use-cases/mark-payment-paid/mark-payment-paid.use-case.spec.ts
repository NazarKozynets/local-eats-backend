import { MarkPaymentPaidUseCase } from './mark-payment-paid.use-case';
import { MarkPaymentPaidCommand } from './mark-payment-paid.command';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { InvalidPaymentStatusTransitionError } from '../../../domain/errors/invalid-payment-status-transition.error';
import { PaymentPaidEvent } from '../../../domain/events/payment-paid.event';
import { PaymentStatusChangedEvent } from '../../../domain/events/payment-status-changed.event';
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

describe('MarkPaymentPaidUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentWriter: ReturnType<typeof createMockOrderPaymentWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkPaymentPaidUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentWriter = createMockOrderPaymentWriter();
        eventPublisher = createMockEventPublisher();

        useCase = new MarkPaymentPaidUseCase(paymentRepository, orderPaymentWriter, eventPublisher);

        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PENDING }));
        paymentRepository.update.mockResolvedValue(undefined);
        orderPaymentWriter.updateOrderPaymentStatus.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides: Partial<{ providerPaymentId: string; paidAt: Date }> = {}) =>
        MarkPaymentPaidCommand.create({
            paymentId: TEST_PAYMENT_ID,
            providerPaymentId: overrides.providerPaymentId ?? 'prov_123',
            paidAt: overrides.paidAt ?? null,
        });

    it('marks PENDING payment as PAID and sets paidAt', async () => {
        const paidAt = new Date('2026-06-01T10:00:00Z');

        await useCase.execute(MarkPaymentPaidCommand.create({ paymentId: TEST_PAYMENT_ID, paidAt }));

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.status).toBe(PaymentStatus.PAID);
        expect(updatedPayment.paidAt).toEqual(paidAt);
    });

    it('stores providerPaymentId when provided', async () => {
        await useCase.execute(command({ providerPaymentId: 'prov_abc' }));

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.providerPaymentId).toBe('prov_abc');
    });

    it('updates order paymentStatus to PAID', async () => {
        await useCase.execute(command());

        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(TEST_ORDER_ID, PaymentStatus.PAID);
    });

    it('fails from invalid status transition (already PAID)', async () => {
        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PAID }));

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidPaymentStatusTransitionError);
    });

    it('publishes PaymentPaidEvent and PaymentStatusChangedEvent', async () => {
        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.any(PaymentPaidEvent),
                expect.any(PaymentStatusChangedEvent),
            ]),
        );
    });

    it('fails if payment not found', async () => {
        paymentRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentNotFoundError);
    });
});
