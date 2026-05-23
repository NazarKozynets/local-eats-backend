import { CreatePaymentUseCase } from './create-payment.use-case';
import { CreatePaymentCommand } from './create-payment.command';
import { PaymentMethod } from '../../../../orders/domain/enums/payment-method.enum';
import { PaymentProvider } from '../../../domain/enums/payment-provider.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { Currency } from '../../../domain/enums/currency.enum';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { PaymentAlreadyExistsError } from '../../../domain/errors/payment-already-exists.error';
import { PaymentOrderAccessDeniedError } from '../../../domain/errors/payment-order-access-denied.error';
import { OrderNotPayableError } from '../../../domain/errors/order-not-payable.error';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { PaymentCreatedEvent } from '../../../domain/events/payment-created.event';
import { PaymentProviderSelector } from '../../services/payment-provider-selector';
import {
    createMockPaymentRepository,
    createMockOrderPaymentReader,
    createMockOrderPaymentWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import {
    TEST_USER_ID,
    TEST_ORDER_ID,
} from '../../../__tests__/_helpers/builders';
import type { OrderPaymentInfo } from '../../ports/order-payment-reader.port';

const MOCK_ORDER_INFO: OrderPaymentInfo = {
    orderId: TEST_ORDER_ID,
    customerId: '660e8400-e29b-41d4-a716-446655440001',
    restaurantId: '770e8400-e29b-41d4-a716-446655440002',
    totalPrice: 20.0,
    currency: Currency.UAH,
    paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    paymentStatus: PaymentStatus.PENDING,
    orderStatus: OrderStatus.CREATED,
};

describe('CreatePaymentUseCase', () => {
    let paymentRepository: ReturnType<typeof createMockPaymentRepository>;
    let orderPaymentReader: ReturnType<typeof createMockOrderPaymentReader>;
    let orderPaymentWriter: ReturnType<typeof createMockOrderPaymentWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let providerSelector: PaymentProviderSelector;
    let useCase: CreatePaymentUseCase;

    beforeEach(() => {
        paymentRepository = createMockPaymentRepository();
        orderPaymentReader = createMockOrderPaymentReader();
        orderPaymentWriter = createMockOrderPaymentWriter();
        eventPublisher = createMockEventPublisher();
        providerSelector = new PaymentProviderSelector();

        useCase = new CreatePaymentUseCase(
            paymentRepository,
            orderPaymentReader,
            orderPaymentWriter,
            eventPublisher,
            providerSelector,
        );

        paymentRepository.save.mockResolvedValue(undefined);
        paymentRepository.existsByOrderId.mockResolvedValue(false);
        orderPaymentReader.getOrderPaymentInfo.mockResolvedValue(MOCK_ORDER_INFO);
        orderPaymentReader.canUserAccessOrderPayment.mockResolvedValue(true);
        orderPaymentWriter.updateOrderPaymentStatus.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () => CreatePaymentCommand.create({ currentUserId: TEST_USER_ID, orderId: TEST_ORDER_ID });

    it('creates CASH payment for CASH_ON_DELIVERY order', async () => {
        await useCase.execute(command());

        expect(paymentRepository.save).toHaveBeenCalledTimes(1);
        const [savedPayment] = paymentRepository.save.mock.calls[0];
        expect(savedPayment.provider).toBe(PaymentProvider.CASH);
        expect(savedPayment.status).toBe(PaymentStatus.PENDING);
        expect(savedPayment.amount).toBe(20.0);
    });

    it('creates MOCK payment for CARD_ONLINE order', async () => {
        orderPaymentReader.getOrderPaymentInfo.mockResolvedValue({
            ...MOCK_ORDER_INFO,
            paymentMethod: PaymentMethod.CARD_ONLINE,
        });

        await useCase.execute(command());

        const [savedPayment] = paymentRepository.save.mock.calls[0];
        expect(savedPayment.provider).toBe(PaymentProvider.MOCK);
    });

    it('fails if order does not exist', async () => {
        orderPaymentReader.getOrderPaymentInfo.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentNotFoundError);
    });

    it('fails if user cannot access order', async () => {
        orderPaymentReader.canUserAccessOrderPayment.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentOrderAccessDeniedError);
    });

    it('fails if payment already exists', async () => {
        paymentRepository.existsByOrderId.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(PaymentAlreadyExistsError);
    });

    it('fails if order is not payable (DELIVERED status)', async () => {
        orderPaymentReader.getOrderPaymentInfo.mockResolvedValue({
            ...MOCK_ORDER_INFO,
            orderStatus: OrderStatus.DELIVERED,
        });

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotPayableError);
    });

    it('sets status PENDING and updates order paymentStatus', async () => {
        await useCase.execute(command());

        expect(orderPaymentWriter.updateOrderPaymentStatus).toHaveBeenCalledWith(
            TEST_ORDER_ID,
            PaymentStatus.PENDING,
        );
    });

    it('publishes PaymentCreatedEvent on success', async () => {
        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(PaymentCreatedEvent)]),
        );
    });
});
