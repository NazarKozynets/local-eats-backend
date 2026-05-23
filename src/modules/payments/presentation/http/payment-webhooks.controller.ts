import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import {
    ApiBody,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import { HandlePaymentWebhookUseCase } from '../../application/use-cases/handle-payment-webhook/handle-payment-webhook.use-case';
import { HandlePaymentWebhookCommand } from '../../application/use-cases/handle-payment-webhook/handle-payment-webhook.command';

@ApiTags('Payment Webhooks')
@Controller('payments/webhooks')
export class PaymentWebhooksController {
    constructor(
        private readonly handleWebhookUseCase: HandlePaymentWebhookUseCase,
    ) {}

    @Post(':provider')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Handle payment provider webhook' })
    @ApiParam({ name: 'provider', enum: PaymentProvider })
    @ApiBody({ schema: { type: 'object' } })
    @ApiNoContentResponse({ description: 'Webhook processed' })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    async handleWebhook(
        @Param('provider') provider: string,
        @Body() payload: Record<string, unknown>,
    ): Promise<void> {
        const validProviders = Object.values(PaymentProvider) as string[];
        if (!validProviders.includes(provider)) {
            return;
        }

        return this.handleWebhookUseCase.execute(
            HandlePaymentWebhookCommand.create({
                provider: provider as PaymentProvider,
                payload,
            }),
        );
    }
}
