import { MarkPaymentFailedUseCase } from './mark-payment-failed.use-case';
import { MarkPaymentFailedCommand } from './mark-payment-failed.command';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { InvalidPaymentStatusTransitionError } from '../../../domain/errors/invalid-payment-status-transition.error';
import { PaymentFailedEvent } from '../../../domain/events/payment-failed.event';
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

describe('MarkPaymentFailedUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentWriter: ReturnType<typeof createMockOrderPaymentWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkPaymentFailedUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentWriter = createMockOrderPaymentWriter();
        eventPublisher = createMockEventPublisher();

        useCase = new MarkPaymentFailedUseCase(paymentRepository, orderPaymentWriter, eventPublisher);

        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PENDING }));
        paymentRepository.update.mockResolvedValue(undefined);
        orderPaymentWriter.updateOrderPaymentStatus.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (reason = 'Insufficient funds') =>
        MarkPaymentFailedCommand.create({ paymentId: TEST_PAYMENT_ID, reason });

    it('marks PENDING payment as FAILED and stores reason', async () => {
        await useCase.execute(command('Card declined'));

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.status).toBe(PaymentStatus.FAILED);
        expect(updatedPayment.failureReason).toBe('Card declined');
    });

    it('updates order paymentStatus to FAILED', async () => {
        await useCase.execute(command());

        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(TEST_ORDER_ID, PaymentStatus.FAILED);
    });

    it('fails if payment not found', async () => {
        paymentRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentNotFoundError);
    });

    it('fails from invalid status transition (already PAID)', async () => {
        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PAID }));

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidPaymentStatusTransitionError);
    });

    it('publishes PaymentFailedEvent', async () => {
        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(PaymentFailedEvent)]),
        );
    });
});
