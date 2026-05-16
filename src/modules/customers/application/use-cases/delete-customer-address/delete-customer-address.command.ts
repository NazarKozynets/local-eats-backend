export type DeleteCustomerAddressCommandProps = {
    userId: string;
    addressId: string;
};

export class DeleteCustomerAddressCommand {
    readonly userId: string;
    readonly addressId: string;

    private constructor(props: { userId: string; addressId: string }) {
        this.userId = props.userId;
        this.addressId = props.addressId;
    }

    static create(props: DeleteCustomerAddressCommandProps): DeleteCustomerAddressCommand {
        return new DeleteCustomerAddressCommand({
            userId: props.userId.trim(),
            addressId: props.addressId.trim(),
        });
    }
}
