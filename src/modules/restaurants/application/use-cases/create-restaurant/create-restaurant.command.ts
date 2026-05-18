export type CreateRestaurantCommandProps = {
    currentUserId: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    city: string;
    addressText: string;
    phone?: string | null;
    email?: string | null;
    minOrderAmount?: number;
    deliveryFee?: number;
};

export class CreateRestaurantCommand {
    readonly currentUserId: string;
    readonly name: string;
    readonly description: string | null;
    readonly logoUrl: string | null;
    readonly coverUrl: string | null;
    readonly city: string;
    readonly addressText: string;
    readonly phone: string | null;
    readonly email: string | null;
    readonly minOrderAmount: number | undefined;
    readonly deliveryFee: number | undefined;

    private constructor(props: CreateRestaurantCommand) {
        Object.assign(this, props);
    }

    static create(props: CreateRestaurantCommandProps): CreateRestaurantCommand {
        return new CreateRestaurantCommand({
            currentUserId: props.currentUserId.trim(),
            name: props.name.trim(),
            description: props.description?.trim() || null,
            logoUrl: props.logoUrl?.trim() || null,
            coverUrl: props.coverUrl?.trim() || null,
            city: props.city.trim(),
            addressText: props.addressText.trim(),
            phone: props.phone?.trim() || null,
            email: props.email?.trim() || null,
            minOrderAmount: props.minOrderAmount,
            deliveryFee: props.deliveryFee,
        });
    }
}
