import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderCustomerProfileNotFoundError } from '../../../domain/errors/order-customer-profile-not-found.error';
import {
    ORDER_REPOSITORY,
    type OrderRepository,
} from '../../ports/order.repository.port';
import {
    CUSTOMER_ORDER_READER,
    type CustomerOrderReader,
} from '../../ports/customer-order-reader.port';
import type { GetMyOrdersCommand } from './get-my-orders.command';
import type { Order } from '../../../domain/entities/order.entity';

@Injectable()
export class GetMyOrdersUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(CUSTOMER_ORDER_READER)
        private readonly customerOrderReader: CustomerOrderReader,
    ) {}

    async execute(command: GetMyOrdersCommand): Promise<Order[]> {
        const profile = await this.customerOrderReader.getProfileByUserId(command.currentUserId);

        if (!profile) {
            throw new OrderCustomerProfileNotFoundError();
        }

        return this.orderRepository.findManyByCustomerId(UUID.create(profile.id));
    }
}
