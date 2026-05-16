export type SetDefaultCustomerAddressCommandProps = {
    userId: string;
    addressId: string;
};

export class SetDefaultCustomerAddressCommand {
    readonly userId: string;
    readonly addressId: string;

    private constructor(props: { userId: string; addressId: string }) {
        this.userId = props.userId;
        this.addressId = props.addressId;
    }

    static create(props: SetDefaultCustomerAddressCommandProps): SetDefaultCustomerAddressCommand {
        return new SetDefaultCustomerAddressCommand({
            userId: props.userId.trim(),
            addressId: props.addressId.trim(),
        });
    }
}
