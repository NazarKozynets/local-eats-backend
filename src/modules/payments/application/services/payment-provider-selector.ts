import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '../../../orders/domain/enums/payment-method.enum';
import { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import { InvalidPaymentProviderError } from '../../domain/errors/invalid-payment-provider.error';

@Injectable()
export class PaymentProviderSelector {
    select(paymentMethod: PaymentMethod): PaymentProvider {
        switch (paymentMethod) {
            case PaymentMethod.CASH_ON_DELIVERY:
                return PaymentProvider.CASH;
            case PaymentMethod.CARD_ONLINE:
                return PaymentProvider.MOCK;
            default:
                throw new InvalidPaymentProviderError(String(paymentMethod));
        }
    }
}
