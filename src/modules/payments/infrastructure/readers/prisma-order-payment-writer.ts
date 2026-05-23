import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { OrderPaymentWriter } from '../../application/ports/order-payment-writer.port';
import type { PaymentStatus } from '../../domain/enums/payment-status.enum';

@Injectable()
export class PrismaOrderPaymentWriter implements OrderPaymentWriter {
    constructor(private readonly prisma: PrismaService) {}

    async updateOrderPaymentStatus(orderId: string, status: PaymentStatus): Promise<void> {
        await this.prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: status },
        });
    }
}
