import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Order } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { Currency } from '../../../domain/enums/currency.enum';
import { OrderCreatedEvent } from '../../../domain/events/order-created.event';
import { OrderStatusChangedEvent } from '../../../domain/events/order-status-changed.event';
import { OrderCustomerProfileNotFoundError } from '../../../domain/errors/order-customer-profile-not-found.error';
import { OrderDeliveryAddressNotFoundError } from '../../../domain/errors/order-delivery-address-not-found.error';
import { OrderDeliveryAddressAccessDeniedError } from '../../../domain/errors/order-delivery-address-access-denied.error';
import { RestaurantNotAvailableForOrderError } from '../../../domain/errors/restaurant-not-available-for-order.error';
import { EmptyOrderError } from '../../../domain/errors/empty-order.error';
import { InvalidOrderQuantityError } from '../../../domain/errors/invalid-order-quantity.error';
import { InvalidOrderItemsError } from '../../../domain/errors/invalid-order-items.error';
import { OrderItemNotAvailableError } from '../../../domain/errors/order-item-not-available.error';
import { OrderItemRestaurantMismatchError } from '../../../domain/errors/order-item-restaurant-mismatch.error';
import {
    ORDER_REPOSITORY,
    type OrderRepository,
} from '../../ports/order.repository.port';
import {
    CUSTOMER_ORDER_READER,
    type CustomerOrderReader,
} from '../../ports/customer-order-reader.port';
import {
    CATALOG_ORDER_READER,
    type CatalogOrderReader,
} from '../../ports/catalog-order-reader.port';
import {
    RESTAURANT_ORDER_READER,
    type RestaurantOrderReader,
} from '../../ports/restaurant-order-reader.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    ORDER_PUBLIC_CODE_GENERATOR,
    type OrderPublicCodeGenerator,
} from '../../ports/order-public-code-generator.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { CreateOrderCommand } from './create-order.command';

function formatAddressText(addr: {
    city: string;
    street: string;
    building: string;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
}): string {
    let text = `${addr.city}, ${addr.street} ${addr.building}`;
    if (addr.apartment) text += `, apt ${addr.apartment}`;
    if (addr.entrance) text += `, entrance ${addr.entrance}`;
    if (addr.floor) text += `, floor ${addr.floor}`;
    return text;
}

@Injectable()
export class CreateOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(CUSTOMER_ORDER_READER)
        private readonly customerOrderReader: CustomerOrderReader,
        @Inject(CATALOG_ORDER_READER)
        private readonly catalogOrderReader: CatalogOrderReader,
        @Inject(RESTAURANT_ORDER_READER)
        private readonly restaurantOrderReader: RestaurantOrderReader,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(ORDER_PUBLIC_CODE_GENERATOR)
        private readonly publicCodeGenerator: OrderPublicCodeGenerator,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateOrderCommand): Promise<void> {
        if (command.items.length === 0) {
            throw new EmptyOrderError();
        }

        for (const item of command.items) {
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                throw new InvalidOrderQuantityError();
            }
        }

        const profile = await this.customerOrderReader.getProfileByUserId(command.currentUserId);
        if (!profile) {
            throw new OrderCustomerProfileNotFoundError();
        }

        const address = await this.customerOrderReader.getAddress(profile.id, command.customerAddressId);
        if (!address) {
            throw new OrderDeliveryAddressNotFoundError();
        }

        if (address.customerId !== profile.id) {
            throw new OrderDeliveryAddressAccessDeniedError();
        }

        const isActive = await this.restaurantAccessReader.existsActiveRestaurant(command.restaurantId);
        if (!isActive) {
            throw new RestaurantNotAvailableForOrderError();
        }

        const menuItemIds = command.items.map((i) => i.menuItemId);
        const catalogItems = await this.catalogOrderReader.getItemsByIds(menuItemIds);

        const catalogMap = new Map(catalogItems.map((ci) => [ci.id, ci]));

        for (const cmdItem of command.items) {
            const catalogItem = catalogMap.get(cmdItem.menuItemId);

            if (!catalogItem) {
                throw new InvalidOrderItemsError(`Menu item ${cmdItem.menuItemId} not found`);
            }

            if (catalogItem.restaurantId !== command.restaurantId) {
                throw new OrderItemRestaurantMismatchError(cmdItem.menuItemId);
            }

            if (catalogItem.status !== 'AVAILABLE') {
                throw new OrderItemNotAvailableError(cmdItem.menuItemId);
            }
        }

        const deliverySettings = await this.restaurantOrderReader.getDeliverySettings(command.restaurantId);

        const deliveryFee = deliverySettings?.deliveryFee ?? 0;
        const minOrderAmount = deliverySettings?.minOrderAmount ?? 0;

        const orderId = UUID.generate();

        const orderItems = command.items.map((cmdItem) => {
            const catalogItem = catalogMap.get(cmdItem.menuItemId)!;
            return OrderItem.create({
                id: UUID.generate(),
                orderId,
                menuItemId: UUID.create(cmdItem.menuItemId),
                nameSnapshot: catalogItem.name,
                priceSnapshot: catalogItem.price,
                quantity: cmdItem.quantity,
                comment: cmdItem.comment,
            });
        });

        const subtotalPrice = orderItems.reduce((sum, item) => sum + item.totalPriceSnapshot, 0);
        const subtotal = Math.round(subtotalPrice * 100) / 100;

        if (minOrderAmount > 0 && subtotal < minOrderAmount) {
            throw new InvalidOrderItemsError(
                `Minimum order amount is ${minOrderAmount}. Your subtotal is ${subtotal}.`,
            );
        }

        const totalPrice = Math.round((subtotal + deliveryFee) * 100) / 100;

        const order = Order.create({
            id: orderId,
            publicCode: this.publicCodeGenerator.generate(),
            customerId: UUID.create(profile.id),
            restaurantId: UUID.create(command.restaurantId),
            paymentMethod: command.paymentMethod,
            currency: Currency.UAH,
            deliveryAddressText: formatAddressText(address),
            customerComment: command.customerComment,
            subtotalPrice: subtotal,
            deliveryFee,
            serviceFee: 0,
            discountAmount: 0,
            totalPrice,
            items: orderItems,
        });

        await this.orderRepository.createWithItems(order, {
            status: OrderStatus.CREATED,
            changedByUserId: command.currentUserId,
            comment: null,
        });

        await this.eventPublisher.publishAll([
            new OrderCreatedEvent(
                order.id.value,
                order.publicCode,
                order.customerId.value,
                order.restaurantId.value,
                command.currentUserId,
            ),
            new OrderStatusChangedEvent(
                order.id.value,
                order.publicCode,
                order.customerId.value,
                order.restaurantId.value,
                OrderStatus.CREATED,
                OrderStatus.CREATED,
                command.currentUserId,
            ),
        ]);
    }
}
