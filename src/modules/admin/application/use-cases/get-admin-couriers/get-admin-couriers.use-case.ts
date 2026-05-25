import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_COURIER_READER,
    type AdminCourierReadModel,
    type AdminCourierReader,
} from '../../ports/admin-courier-reader.port';
import type { GetAdminCouriersCommand } from './get-admin-couriers.command';

@Injectable()
export class GetAdminCouriersUseCase {
    constructor(
        @Inject(ADMIN_COURIER_READER)
        private readonly courierReader: AdminCourierReader,
    ) {}

    execute(command: GetAdminCouriersCommand): Promise<AdminCourierReadModel[]> {
        return this.courierReader.findMany(command);
    }
}
