import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_ORDER_READER,
    type AdminOrderReadModel,
    type AdminOrderReader,
} from '../../ports/admin-order-reader.port';
import type { GetAdminOrdersCommand } from './get-admin-orders.command';

@Injectable()
export class GetAdminOrdersUseCase {
    constructor(
        @Inject(ADMIN_ORDER_READER)
        private readonly orderReader: AdminOrderReader,
    ) {}

    execute(command: GetAdminOrdersCommand): Promise<AdminOrderReadModel[]> {
        return this.orderReader.findMany(command);
    }
}
