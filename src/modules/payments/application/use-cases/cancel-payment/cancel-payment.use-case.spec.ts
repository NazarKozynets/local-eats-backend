import { CancelPaymentUseCase } from './cancel-payment.use-case';
import { CancelPaymentCommand } from './cancel-payment.command';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { InvalidPaymentStatusTransitionError } from '../../../domain/errors/invalid-payment-status-transition.error';
import { PaymentCancelledEvent } from '../../../domain/events/payment-cancelled.event';
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

describe('CancelPaymentUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentWriter: ReturnType<typeof createMockOrderPaymentWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CancelPaymentUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentWriter = createMockOrderPaymentWriter();
        eventPublisher = createMockEventPublisher();

        useCase = new CancelPaymentUseCase(paymentRepository, orderPaymentWriter, eventPublisher);

        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PENDING }));
        paymentRepository.update.mockResolvedValue(undefined);
        orderPaymentWriter.updateOrderPaymentStatus.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () => CancelPaymentCommand.create({ paymentId: TEST_PAYMENT_ID });

    it('cancels a PENDING payment', async () => {
        await useCase.execute(command());

        const [updatedPayment] = paymentRepository.update.mock.calls[0];
        expect(updatedPayment.status).toBe(PaymentStatus.CANCELLED);
    });

    it('updates order paymentStatus to CANCELLED', async () => {
        await useCase.execute(command());

        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(
            TEST_ORDER_ID,
            PaymentStatus.CANCELLED,
        );
    });

    it('fails if payment is already PAID', async () => {
        paymentRepository.findById.mockResolvedValue(buildPayment({ status: PaymentStatus.PAID }));

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidPaymentStatusTransitionError);
    });

    it('fails if payment not found', async () => {
        paymentRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentNotFoundError);
    });

    it('publishes PaymentCancelledEvent', async () => {
        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(PaymentCancelledEvent)]),
        );
    });
});
