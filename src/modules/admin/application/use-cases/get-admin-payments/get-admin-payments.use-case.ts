import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_PAYMENT_READER,
    type AdminPaymentReadModel,
    type AdminPaymentReader,
} from '../../ports/admin-payment-reader.port';
import type { GetAdminPaymentsCommand } from './get-admin-payments.command';

@Injectable()
export class GetAdminPaymentsUseCase {
    constructor(
        @Inject(ADMIN_PAYMENT_READER)
        private readonly paymentReader: AdminPaymentReader,
    ) {}

    execute(command: GetAdminPaymentsCommand): Promise<AdminPaymentReadModel[]> {
        return this.paymentReader.findMany(command);
    }
}
