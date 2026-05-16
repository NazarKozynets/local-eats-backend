export type UpdateCustomerAddressCommandProps = {
    userId: string;
    addressId: string;
    label?: string | null;
    city?: string;
    street?: string;
    building?: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    comment?: string | null;
};

export class UpdateCustomerAddressCommand {
    readonly userId: string;
    readonly addressId: string;
    readonly label: string | null | undefined;
    readonly city: string | undefined;
    readonly street: string | undefined;
    readonly building: string | undefined;
    readonly apartment: string | null | undefined;
    readonly entrance: string | null | undefined;
    readonly floor: string | null | undefined;
    readonly comment: string | null | undefined;

    private constructor(props: {
        userId: string;
        addressId: string;
        label: string | null | undefined;
        city: string | undefined;
        street: string | undefined;
        building: string | undefined;
        apartment: string | null | undefined;
        entrance: string | null | undefined;
        floor: string | null | undefined;
        comment: string | null | undefined;
    }) {
        Object.assign(this, props);
    }

    static create(props: UpdateCustomerAddressCommandProps): UpdateCustomerAddressCommand {
        return new UpdateCustomerAddressCommand({
            userId: props.userId.trim(),
            addressId: props.addressId.trim(),
            label: props.label !== undefined ? (props.label?.trim() || null) : undefined,
            city: props.city !== undefined ? props.city.trim() : undefined,
            street: props.street !== undefined ? props.street.trim() : undefined,
            building: props.building !== undefined ? props.building.trim() : undefined,
            apartment: props.apartment !== undefined ? (props.apartment?.trim() || null) : undefined,
            entrance: props.entrance !== undefined ? (props.entrance?.trim() || null) : undefined,
            floor: props.floor !== undefined ? (props.floor?.trim() || null) : undefined,
            comment: props.comment !== undefined ? (props.comment?.trim() || null) : undefined,
        });
    }
}
