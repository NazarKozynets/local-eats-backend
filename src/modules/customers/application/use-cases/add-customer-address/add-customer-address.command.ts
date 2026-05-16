export type AddCustomerAddressCommandProps = {
    userId: string;
    label?: string | null;
    city: string;
    street: string;
    building: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    comment?: string | null;
    isDefault?: boolean;
};

export class AddCustomerAddressCommand {
    readonly userId: string;
    readonly label: string | null;
    readonly city: string;
    readonly street: string;
    readonly building: string;
    readonly apartment: string | null;
    readonly entrance: string | null;
    readonly floor: string | null;
    readonly comment: string | null;
    readonly isDefault: boolean;

    private constructor(props: {
        userId: string;
        label: string | null;
        city: string;
        street: string;
        building: string;
        apartment: string | null;
        entrance: string | null;
        floor: string | null;
        comment: string | null;
        isDefault: boolean;
    }) {
        Object.assign(this, props);
    }

    static create(props: AddCustomerAddressCommandProps): AddCustomerAddressCommand {
        return new AddCustomerAddressCommand({
            userId: props.userId.trim(),
            label: props.label?.trim() || null,
            city: props.city.trim(),
            street: props.street.trim(),
            building: props.building.trim(),
            apartment: props.apartment?.trim() || null,
            entrance: props.entrance?.trim() || null,
            floor: props.floor?.trim() || null,
            comment: props.comment?.trim() || null,
            isDefault: props.isDefault ?? false,
        });
    }
}
