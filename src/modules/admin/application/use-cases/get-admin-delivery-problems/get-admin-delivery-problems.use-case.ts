import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_DELIVERY_PROBLEM_READER,
    type AdminDeliveryProblemReadModel,
    type AdminDeliveryProblemReader,
} from '../../ports/admin-delivery-problem-reader.port';
import type { GetAdminDeliveryProblemsCommand } from './get-admin-delivery-problems.command';

@Injectable()
export class GetAdminDeliveryProblemsUseCase {
    constructor(
        @Inject(ADMIN_DELIVERY_PROBLEM_READER)
        private readonly deliveryProblemReader: AdminDeliveryProblemReader,
    ) {}

    execute(command: GetAdminDeliveryProblemsCommand): Promise<AdminDeliveryProblemReadModel[]> {
        return this.deliveryProblemReader.findMany(command);
    }
}
