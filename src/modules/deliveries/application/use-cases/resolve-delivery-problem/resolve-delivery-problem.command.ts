export class ResolveDeliveryProblemCommand {
    readonly adminUserId: string;
    readonly problemReportId: string;

    private constructor(props: ResolveDeliveryProblemCommand) { Object.assign(this, props); }

    static create(props: { adminUserId: string; problemReportId: string }): ResolveDeliveryProblemCommand {
        return new ResolveDeliveryProblemCommand(props);
    }
}
