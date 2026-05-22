export class StartOrderPreparationCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: StartOrderPreparationCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string; orderId: string }): StartOrderPreparationCommand {
        return new StartOrderPreparationCommand(props);
    }
}
