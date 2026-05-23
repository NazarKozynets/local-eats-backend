import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider } from '../../../domain/enums/payment-provider.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { Currency } from '../../../domain/enums/currency.enum';

export class PaymentResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orderId!: string;

    @ApiProperty({ enum: PaymentProvider })
    provider!: PaymentProvider;

    @ApiProperty({ enum: PaymentStatus })
    status!: PaymentStatus;

    @ApiProperty()
    amount!: number;

    @ApiProperty({ enum: Currency })
    currency!: Currency;

    @ApiPropertyOptional()
    providerPaymentId!: string | null;

    @ApiPropertyOptional()
    failureReason!: string | null;

    @ApiPropertyOptional()
    paidAt!: Date | null;

    @ApiPropertyOptional()
    refundedAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
