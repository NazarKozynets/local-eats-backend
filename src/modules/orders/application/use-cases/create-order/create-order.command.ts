import type { PaymentMethod } from '../../../domain/enums/payment-method.enum';

export type CreateOrderItemInput = {
    menuItemId: string;
    quantity: number;
    comment?: string | null;
};

export type CreateOrderCommandProps = {
    currentUserId: string;
    restaurantId: string;
    customerAddressId: string;
    paymentMethod: PaymentMethod;
    customerComment?: string | null;
    items: CreateOrderItemInput[];
};

export class CreateOrderCommand {
    readonly currentUserId: string;
    readonly restaurantId: string;
    readonly customerAddressId: string;
    readonly paymentMethod: PaymentMethod;
    readonly customerComment: string | null;
    readonly items: Array<{ menuItemId: string; quantity: number; comment: string | null }>;

    private constructor(props: CreateOrderCommand) {
        Object.assign(this, props);
    }

    static create(props: CreateOrderCommandProps): CreateOrderCommand {
        return new CreateOrderCommand({
            currentUserId: props.currentUserId,
            restaurantId: props.restaurantId,
            customerAddressId: props.customerAddressId,
            paymentMethod: props.paymentMethod,
            customerComment: props.customerComment ?? null,
            items: props.items.map((i) => ({
                menuItemId: i.menuItemId,
                quantity: i.quantity,
                comment: i.comment ?? null,
            })),
        });
    }
}
