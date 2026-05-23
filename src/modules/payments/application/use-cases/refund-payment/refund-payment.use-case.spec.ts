import { RefundPaymentUseCase } from './refund-payment.use-case';
import { RefundPaymentCommand } from './refund-payment.command';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { InvalidPaymentStatusTransitionError } from '../../../domain/errors/invalid-payment-status-transition.error';
import { PaymentRefundedEvent } from '../../../domain/events/payment-refunded.event';
import {
    createMockPaymentRepository,
    createMockOrderPaymentWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import {
    buildPayment,
    TEST_PAYMENT_ID,
    TEST_ORDER_ID,
    TEST_ADMIN_USER_ID,
} from '../../../__tests__/_helpers/builders';

describe('RefundPaymentUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentWriter: ReturnType<typeof createMockOrderPaymentWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: RefundPaymentUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentWriter = createMockOrderPaymentWriter();
        eventPublisher = createMockEventPublisher();

        useCase = new RefundPaymentUseCase(paymentRepository, orderPaymentWriter, eventPublisher);

        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PAID }));
        paymentRepository.update.mockResolvedValue(undefined);
        orderPaymentWriter.updateOrderPaymentStatus.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        RefundPaymentCommand.create({ paymentId: TEST_PAYMENT_ID, actorUserId: TEST_ADMIN_USER_ID });

    it('refunds a PAID payment and sets refundedAt', async () => {
        await useCase.execute(command());

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.status).toBe(PaymentStatus.REFUNDED);
        expect(updatedPayment.refundedAt).toBeInstanceOf(Date);
    });

    it('updates order paymentStatus to REFUNDED', async () => {
        await useCase.execute(command());

        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(
            TEST_ORDER_ID,
            PaymentStatus.REFUNDED,
        );
    });

    it('fails if payment is not PAID (PENDING state)', async () => {
        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PENDING }));

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidPaymentStatusTransitionError);
    });

    it('fails if payment not found', async () => {
        paymentRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentNotFoundError);
    });

    it('publishes PaymentRefundedEvent', async () => {
        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(PaymentRefundedEvent)]),
        );
    });
});
