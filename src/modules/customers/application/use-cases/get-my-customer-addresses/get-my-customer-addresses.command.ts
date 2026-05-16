export type GetMyCustomerAddressesCommandProps = {
    userId: string;
};

export class GetMyCustomerAddressesCommand {
    readonly userId: string;

    private constructor(props: { userId: string }) {
        this.userId = props.userId;
    }

    static create(props: GetMyCustomerAddressesCommandProps): GetMyCustomerAddressesCommand {
        return new GetMyCustomerAddressesCommand({
            userId: props.userId.trim(),
        });
    }
}
